import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { AppDataService } from '../services/app-data.service';
import { SidStatusService } from '../services/sid-status.service';
import { PiaService } from '../entry/pia.service';
import { PiaApi } from '@api/services';
import { PiaModel } from '@api/models';
import { ModalsService } from 'app/modals/modals.service';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['../processing/processing.component.scss', './sections.component.scss'],
  providers: []
})
export class SectionsComponent implements OnInit {

  @Input() currentProcessingSection: any;
  @Input() processing: any;
  @Input() processingSections: any;
  @Output() changeProcessingSectionEvent: EventEmitter<any> = new EventEmitter<number>();

  @Input() piaSection: { id: number, permissions: string[], title: string, short_help: string, items: any };
  @Input() piaItem: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  data: { sections: any };
  pias: any;

  constructor(
    public _piaService: PiaService,
    private _appDataService: AppDataService,
    public _sidStatusService: SidStatusService,
    private piaApi: PiaApi,
    private _modalsService: ModalsService
  ) {}

  async ngOnInit() {
    this.data = await this._appDataService.getDataNav(this._piaService.pia);
  
    if (this.processing && this.processing.pias_count > 0) {
      if (this._piaService.pia.id && this.piaSection) {
        this.loadPiaData();
      } else {
        this._piaService.pia = new PiaModel;
        this.piaApi.getAll({'processing': this.processing.id}).subscribe((pias) => {
          this.pias = pias.sort((a, b) => {
            if (a.status > b.status) return 1;
            if (a.status < b.status) return -1;
            if (a.updated_at > b.updated_at) return -1;
            if (a.updated_at < b.updated_at) return 1;
            return 0;
          });
          this._piaService.pia = this.pias[0];
          this.loadPiaData();
        });
      }

    }
  }
    
  /**
   * Change processing section
   *
   * @param sectionId
   */
  changeProcessingSection(sectionId) {
    this.changeProcessingSectionEvent.emit(sectionId);
  }

  /**
   * Load PIA data
   *
   * 
   */
  loadPiaData() {
    this.data.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        this._sidStatusService.setSidStatus(this._piaService, section, item);
      });
    });
  }

  openHistoryModal() {
    const history = {
      createdBy: '',
      createdOn: '',
      updatedBy: '',
      updatedOn: '',
      evaluationRequestedBy: '',
      evaluationRequestedOn: '',
      evaluatedBy: '',
      evaluatedOn: '',
      issueRequestedBy: '',
      issueRequestedOn: '',
      noticedBy: '',
      noticedOn: '',
      validationRequestedBy: '',
      validationRequestedOn: '',
      validatedBy: '',
      validatedOn: ''
    };
    if (this.processing.trackings) {
      this.processing.trackings.forEach((action) => {
        switch (action.activity) {
          case 'created':
            history.createdBy = action.fullname;
            const createDate = new Date(action.date)
            history.createdOn = createDate.toLocaleDateString();
            break;
          case 'last-update':
            history.updatedBy = action.fullname;
            const updateDate = new Date(action.date)
            history.updatedOn = updateDate.toLocaleDateString();
            break;
          case 'evaluation-request':
            history.evaluationRequestedBy = action.fullname;
            const evaluationRequestDate = new Date(action.date)
            history.evaluationRequestedOn = evaluationRequestDate.toLocaleDateString();
            break;
          case 'evaluation':
            history.evaluatedBy = action.fullname;
            const evaluationDate = new Date(action.date)
            history.evaluatedOn = evaluationDate.toLocaleDateString();
            break;
          case 'issue-request':
            history.issueRequestedBy = action.fullname;
            const issueRequestDate = new Date(action.date)
            history.issueRequestedOn = issueRequestDate.toLocaleDateString();
            break;
          case 'notice-issued':
            history.noticedBy = action.fullname;
            const noticeDate = new Date(action.date)
            history.noticedOn = noticeDate.toLocaleDateString();
            break;
          case 'validation-request':
            history.validationRequestedBy = action.fullname;
            const validationRequestDate = new Date(action.date)
            history.validationRequestedOn = validationRequestDate.toLocaleDateString();
            break;
          case 'validated':
            history.validatedBy = action.fullname;
            const validateDate = new Date(action.date)
            history.validatedOn = validateDate.toLocaleDateString();
            break;
        }
      });
    }
    this._modalsService.openModal('modal-pia-history', {history});
  }

}
