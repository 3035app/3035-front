import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BreachModel } from '@api/models';
import { BreachFormComponent } from './breach-form/breach-form.component';
import { ModalsService } from '../modals/modals.service';
import { PiaService } from '../entry/pia.service';
import { PiaApi } from '@api/services';
import { PiaModel } from '@api/models';
import { PiaStatus } from '@api/model/pia.model';

@Component({
  selector: 'app-breach',
  templateUrl: './breach.component.html',
  styleUrls: ['./breach.component.scss']
})
export class BreachComponent implements OnInit {
  @ViewChild(BreachFormComponent) formComponent: BreachFormComponent;
  breach: BreachModel;
  sections: any;
  currentSection: any// Section;

  constructor(
    private route: ActivatedRoute,
    protected _modalsService: ModalsService,
    private _piaService: PiaService,
    private piaApi: PiaApi
  ) {
  }

  ngOnInit() {
    this.sections = [
      {
        'id': 1,
        'name': 'general',
        'title': 'Violation'
      },
      {
        'id': 2,
        'name': 'general',
        'title': 'Mesures'
      },
      {
        'id': 3,
        'name': 'general',
        'title': 'Personnes concernées'
      }
    ];

    this.breach = this.route.snapshot.data.breach;

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
}

interface Section {
  id: number
  title: string
  evaluation_mode: string
  short_help: string
  questions: any
}
