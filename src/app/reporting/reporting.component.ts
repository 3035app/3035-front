import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { StructureModel } from '@api/models';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PiaApi, FolderApi, ProcessingApi } from '@api/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {

  @Input() structure: StructureModel;
  editor: any;
  elementId: string;
  folders: any[] = [];
  processings: any[] = [];
  pias: any[] = [];

  @ViewChild('structureForm') structureForm: NgForm;

  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    aspectRatio: 1,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          let sum = 0;
          const dataArr = ctx.chart.data.datasets[0].data;
          dataArr.map(data => {
              sum += data;
          });
          const percentage = (value * 100 / sum).toFixed(2) + '%';
          return percentage;
        },
        color: '#fff',
      }
  }
  };
  public barChartLabels = ['En cours', 'Validé', 'Inconnu', 'En cours', 'Validé', 'Inconnu'];
  public barChartType = 'pie';
  public barChartLegend = true;
  public barChartData = [
    {data: [10, 38, 7], label: 'Series A'}
  ];

  public PIAByStatus = {data: [{data: [], label: 'Series A'}], labels: []}
  public PIAByFolder = {data: [{data: [], label: 'Series A'}], labels: []}
  public ProcessingByStatus = {data: [{data: [], label: 'Series A'}], labels: []}

  constructor(
    private route: ActivatedRoute,
    private piaApi: PiaApi,
    private folderApi: FolderApi,
    private processingApi: ProcessingApi,
    private translate: TranslateService,
  ) {

   }

  ngOnInit() {
    this.structure = this.route.snapshot.data.structure;

    this.folderApi.getAll(this.structure.id).subscribe(async folder => {
      await this.getDataForKpi(folder.map(item => item.id), null);
      this.formatPIAData();
      this.formatProcessingData();
    })
  }

  private formatPIAData() {
    const piaDataByStatus = {};
    const piaDataByFolder = {};

    this.pias.map(pia => {
      if (!(pia.status in piaDataByStatus)) {
        piaDataByStatus[pia.status] = 1;
      } else {
        piaDataByStatus[pia.status] += 1;
      }

      if (!(pia.folderId in piaDataByFolder)) {
        piaDataByFolder[pia.folderId] = 1;
      } else {
        piaDataByFolder[pia.folderId] += 1;
      }
    })
    const piaByStatusLabels = [];
    const piaByStatusData = [];

    for (const [key, value] of Object.entries(piaDataByStatus)) {
      piaByStatusLabels.push(this.getPIAStatusLabel(key));
      piaByStatusData.push(value);
    }

    this.PIAByStatus.labels = piaByStatusLabels;
    this.PIAByStatus.data[0].data = piaByStatusData;

    const piaByFolderLabels = [];
    const piaByFolderData = [];

    for (const [key, value] of Object.entries(piaDataByFolder)) {
      const foundFolder = this.folders.find(folder => folder.id === Number(key));
      piaByFolderLabels.push(foundFolder ? foundFolder.name : 'Unknown');
      piaByFolderData.push(value);
    }

    this.PIAByFolder.labels = piaByFolderLabels;
    this.PIAByFolder.data[0].data = piaByFolderData;
  }

  private formatProcessingData() {
    const processingDataByStatus = {};

    this.processings.map(processing => {
      if (!(processing.status in processingDataByStatus)) {
        processingDataByStatus[processing.status] = 1;
      } else {
        processingDataByStatus[processing.status] += 1;
      }
    })
    const processingByStatusLabels = [];
    const processingByStatusData = [];

    for (const [key, value] of Object.entries(processingDataByStatus)) {
      processingByStatusLabels.push(this.getProcessingStatusLabel(key));
      processingByStatusData.push(value);
    }

    this.ProcessingByStatus.labels = processingByStatusLabels;
    this.ProcessingByStatus.data[0].data = processingByStatusData;

  }

  private getPIAStatusLabel(status): string {
    return status >= 0 ? this.translate.instant(`pia.statuses.${status}`) : 'Unknown';
  }

  private getProcessingStatusLabel(status): string {
    return status >= 0 ? this.translate.instant(`processing.statuses.${status}`) : 'Unknown';
  }

  async getDataForKpi(folder, processing, parentFolderId = null) {
    if (processing && Array.isArray(processing) && processing.length > 0) {
      await Promise.all(processing.map(async processId => {

        const data: any = await this.processingApi.export(processId).toPromise();
        const pias = await this.piaApi.getAll({'processing' : processId}).toPromise();

        await Promise.all(pias.map(pia => this.pias.push({...pia, processId, folderId: parentFolderId})));
        this.processings.push({...data, folderId: parentFolderId});
        return Promise.resolve();
      }));
    }
    if (folder && Array.isArray(folder) && folder.length > 0) {
      await Promise.all(folder.map( async folderId => {
        let folderData = null;
        try {
        folderData = await this.folderApi.get(this.structure.id, folderId).toPromise();
        } catch (e) {
          console.log(e)
          return Promise.reject(e);
        }
        this.folders.push(folderData)
        const folderIds = folderData.children.map(children => children.id)
        const ProcessingIds = folderData.processings.map(process => process.id)
        try {
          await this.getDataForKpi(folderIds, ProcessingIds, folderData.id)
        } catch (e) {
          console.log(e)
          return Promise.reject(e);
        }
        return Promise.resolve();
      }));
    }
  }


}
