import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { AppDataService } from '../services/app-data.service';
import { SidStatusService } from '../services/sid-status.service';
import { PiaService } from '../entry/pia.service';
import { PiaApi } from '@api/services';
import { PiaModel } from '@api/models';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['../processing/processing.component.scss', '../entry/sections/sections.component.scss'],
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
    private piaApi: PiaApi
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

}
