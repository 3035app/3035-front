import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PiaModel, ProcessingModel } from '@api/models';
import { ProcessingFormComponent } from './processing-form/processing-form.component';
import { ModalsService } from '../modals/modals.service';
import { PiaService } from '../entry/pia.service';
import { PiaApi } from '@api/services';

@Component({
  selector: 'app-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss']
})
export class ProcessingComponent implements OnInit {
  @ViewChild(ProcessingFormComponent) formComponent: ProcessingFormComponent;
  processing: ProcessingModel;
  sections: any;
  currentSection: Section;
  pias: PiaModel[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    protected _modalsService: ModalsService,
    private _piaService: PiaService,
    private piaApi: PiaApi
  ) {
  }

  ngOnInit() {
    this.sections = this.route.snapshot.data.sections;
    this.processing = this.route.snapshot.data.processing;

    this._piaService.currentProcessing = this.processing;

    this.piaApi.getAll({'processing': this.processing.id}).subscribe((pias) => {
      this.pias = pias.sort((a, b) => {
        if (a.status > b.status) return 1;
        if (a.status < b.status) return -1;
        if (a.updated_at > b.updated_at) return -1;
        if (a.updated_at < b.updated_at) return 1;
        return 0;
      });
    });

    this.changeSection(1);
  }

  /**
   * Change current section
   *
   * @param sectionId
   */
  changeSection(sectionId) {
    this.currentSection = this.sections.filter((section) => section.id === sectionId)[0];
    window.scrollTo(0, 0);
  }

  public displayKnowledgeBaseForSection(section?: Section): void {
    if (section === null) {
      section = this.sections
    }
    if (section.id === 1) {
      this.formComponent.updateKnowledgeBase([
        'PIA_LGL_DESC',
        'PIA_LGL_FIN',
        'PIA_LGL_FOND'
      ]);
    }
    if (section.id === 2) {
      this.formComponent.updateKnowledgeBase([
        'PIA_LGL_DATA',
        'PIA_LGL_DUR'
      ]);
    }
    if (section.id === 3) {
      this.formComponent.updateKnowledgeBase([
        'PIA_LGL_LFC',
        'PIA_LGL_ST',
        'PIA_LGL_DEST',
        'PIA_LGL_TRAN'
      ]);
    }
  }

  createPia() {
    if (this._piaService.currentProcessing.evaluator_pending && this._piaService.currentProcessing.data_protection_officer_pending) {
      const pia = new PiaModel();
      // disable the type feature
      pia.type = 'advanced';
      pia.processing = this._piaService.currentProcessing;
      pia.redactor_id = this._piaService.currentProcessing.redactor.id;
      pia.evaluator_id = this._piaService.currentProcessing.evaluator_pending.id;
      pia.data_protection_officer_id = this._piaService.currentProcessing.data_protection_officer_pending.id;
      this.piaApi.create(pia).subscribe((newPia: PiaModel) => {
        this.router.navigate(['entry', newPia.id, 'section', 3, 'item', 1]);
      });
    } else {
      this._modalsService.openModal('modal-list-new-pia', {processing: this._piaService.currentProcessing});
    }
  }
}

interface Section {
  id: number
  title: string
  evaluation_mode: string
  short_help: string
  questions: any
}
