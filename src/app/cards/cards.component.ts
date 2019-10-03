import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';

import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';

import { FolderModel, ProcessingModel } from '@api/models';
import { FolderApi, ProcessingApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';
import { ProfileSession } from '../services/profile-session.service';
import { TranslateService } from '@ngx-translate/core';


interface FolderCsvRow {
  name: string;
  id: number;
  path: string;
  parentId?: number;
  person_in_charge: string;
  structure_id: number;
}

interface ProcessingCsvRow {
  id: number;
  parentId: number;
  author: string;
  consent: string;
  context_of_implementation: string;
  controllers: string;
  description: string;
  designated_controller: string;
  exactness: string;
  life_cycle: string;
  minimization: string;
  name: string;
  non_eu_transfer: string;
  processors: string;
  standards: string;
  status: string;
  storage: string;
  processing_data_types: string;
}


interface PiaCsvRow {
  processingId: number;
  author_name: string;
  concerned_people_opinion: string;
  concerned_people_searched_content: string;
  concerned_people_searched_opinion: string;
  concerned_people_status: number;
  dpo_opinion: string;
  dpo_status: number;
  dpos_names: string;
  evaluator_name: string;
  is_example: boolean;
  number_of_questions: number;
  people_names: string;
  progress: number;
  rejection_reason: string;
  status: string;
  type: string;
  validator_name: string;
  answers: any;
}

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})

export class CardsComponent implements OnInit {
  newProcessing: ProcessingModel;
  processingForm: FormGroup;
  // importPiaForm: FormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string }
  view: 'card';
  folderId: number;
  itemToMove: any = null;
  folderToExport: FolderCsvRow[] = [];
  processingToExport: ProcessingCsvRow[] = [];
  piaToExport: PiaCsvRow[] = [];
  // canCreatePIA: boolean;
  canCreateProcessing: boolean;
  selectedFolder: any = [];
  selectedProcessing: any = [];
  public structure: any;

  constructor(
    private route: ActivatedRoute,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    private permissionsService: PermissionsService,
    private processingApi: ProcessingApi,
    private folderApi: FolderApi,
    private session: ProfileSession,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.structure = this.session.getCurrentStructure();
    this.permissionsService.hasPermission('CanCreateProcessing').then((bool: boolean) => {
      this.canCreateProcessing = bool;
    });
    this.applySortOrder();
    // this.initPiaForm();
    this.initProcessingForm();
  }


  /**
   * Sort items.
   * @param {string} fieldToSort - Field to sort.
   * @memberof CardsComponent
   */
  sortBy(fieldToSort: string) {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sortElements();
    localStorage.setItem('sortValue', this.sortValue);
    localStorage.setItem('sortOrder', this.sortOrder);
  }

  /**
   * Display elements in list view.
   * @memberof CardsComponent
   */
  viewOnList() {
    this.viewStyle.view = 'list';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.refreshContent();
  }

  /**
   * Display elements in card view.
   * @memberof CardsComponent
   */
  viewOnCard() {
    this.viewStyle.view = 'card';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.refreshContent();
  }

  /**
   * Refresh the list.
   * @memberof CardsComponent
   */
  async refreshContent() {
    const theFolders = await this.fetchFolders();

    this.handleFoldersCollection(theFolders);

    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    this.sortElements();
  }

  protected fetchFolders() {
    if (this.folderId !== null) {
      return this.folderApi.get(this.structure.id, this.folderId).toPromise()
    }
    return this.folderApi.getAll(this.structure.id).toPromise();
  }

  protected handleFoldersCollection(folderOrFolderCollection: any) {
    let folder: FolderModel;
    if (folderOrFolderCollection instanceof FolderModel) {
      folder = folderOrFolderCollection;
    } else {
      folder = folderOrFolderCollection[0];
    }
    this._piaService.currentFolder = folder;
    this._piaService.processings = folder.processings;
    this._piaService.folders = folder.children;
  }

  /**
   * Define how to sort the list.
   * @private
   * @memberof CardsComponent
   */
  protected sortElements() {
    if (this._piaService.processings !== undefined) {
      this._piaService.processings.sort((a, b) => {
        let firstValue = a[this.sortValue];
        let secondValue = b[this.sortValue];
        if (this.sortValue === 'updated_at' || this.sortValue === 'created_at') {
          firstValue = new Date(a[this.sortValue]);
          secondValue = new Date(b[this.sortValue]);
        }
        if (this.sortValue === 'name' || this.sortValue === 'author') {
          return firstValue.localeCompare(secondValue);
        } else {
          if (firstValue < secondValue) {
            return -1;
          }
          if (firstValue > secondValue) {
            return 1;
          }
          return 0;
        }
      });
      if (this.sortOrder === 'up') {
        this._piaService.processings.reverse();
      }
    }
  }

  protected applySortOrder() {
    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');

    if (!this.sortOrder || !this.sortValue) {
      this.sortOrder = 'up';
      this.sortValue = 'updated_at';
      localStorage.setItem('sortOrder', this.sortOrder);
      localStorage.setItem('sortValue', this.sortValue);
    }
  }

  protected initProcessingForm() {
    this.processingForm = new FormGroup({
      name: new FormControl(),
      author: new FormControl(),
      controllers: new FormControl()
    });
    this.viewStyle = {
      view: this.route.snapshot.params['view']
    }

    this.route.params.subscribe(
      (params: Params) => {
        this.viewStyle.view = params['view'];
        this.folderId = (params.id ? params.id : null);
        this.viewOnCard();
        /*if (localStorage.getItem('homepageDisplayMode') === 'list') {
          this.viewOnList();
        } else {
          this.viewOnCard();
        }*/
      }
    );
  }

  onDragStart(item: any) {
    this.itemToMove = item;
  }

  onDragCanceled() {
    this.itemToMove = null;
  }

  onDrop(targetFolder: FolderModel) {
    if (this.itemToMove) {
      if (this.itemToMove instanceof FolderModel) {
        if (this.itemToMove.id === parseInt(targetFolder.id, 10)) {
          return;
        }

        this.itemToMove.parent = targetFolder;

        this.folderApi.update(this.itemToMove).subscribe(() => {
          this.refreshContent();
        });

        return;
      }

      this.itemToMove.folder = targetFolder;

      this.processingApi.update(this.itemToMove).subscribe(() => {
        this.refreshContent();
      });
    }
  }

  private currentFolderIsRoot(): boolean {
    return this._piaService.currentFolder.parent.isRoot;
  }

  getRouteToParentFolder(): string {
    let route = '/folders';
    if (!this.currentFolderIsRoot()) {
      const parentId = this._piaService.currentFolder.parent.id;
      route = '/folders/' + parentId;
    }
    return route;
  }

  handleFolderCheckChange(event) {
    if (event.checked) {
      this.selectedFolder.push(event.id)
    } else {
      this.selectedFolder = this.selectedFolder.filter(folderId => folderId !== event.id)
    }
  }

  handleProcessingCheckChange(event) {
    if (event.checked) {
      this.selectedProcessing.push(event.id)
    } else {
      this.selectedProcessing = this.selectedProcessing.filter(processId => processId !== event.id)
    }
  }

  async exportCsv() {
    if (this.selectedFolder.length === 0 && this.selectedProcessing.length === 0) {
      return;
    }
    this.folderToExport = [];
    this.processingToExport = [];

    try {
      await this.getDataToExport(this.selectedFolder, this.selectedProcessing)
    } catch (e) {
      console.log(e)
    }
    console.log(this.folderToExport)
    console.log(this.processingToExport)
    console.log(this.translate.instant('sections.3.items.2.questions.3'));

    const options = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useBom: true,
      headers: [
        'id',
        'name',
        'path',
        'parentId',
        'person_in_charge',
        'structure_id'
      ]}

    new Angular5Csv(this.folderToExport, 'folders', options)

    const optionsProcess = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useBom: true,
      headers: [
        'id',
        'name',
        'parentId',
        'author',
        'consent',
        'context_of_implementation',
        'controllers',
        'description',
        'designated_controller',
        'exactness',
        'life_cycle',
        'minimization',
        'non_eu_transfer',
        'processors',
        'standards',
        'status',
        'storage',
        'processing_data_types',
      ]}

    new Angular5Csv(this.processingToExport, 'processing', optionsProcess)

    const piaHeaders =  [
      'processingId',
      'author_name',
      'concerned_people_opinion',
      'concerned_people_searched_content',
      'concerned_people_searched_opinion',
      'concerned_people_status',
      'dpo_opinion',
      'dpo_status',
      'dpos_names',
      'evaluator_name',
      'is_example',
      'number_of_questions',
      'people_names',
      'progress',
      'rejection_reason',
      'status',
      'type',
      'validator_name',
      'answers'
    ];


    const optionsPia = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      useBom: true,
      headers: piaHeaders
    }

    new Angular5Csv(this.piaToExport, 'pia', optionsPia)
  }

  async getDataToExport(folder, processing, parentFolder = null) {
    if (processing && Array.isArray(processing) && processing.length > 0) {
      processing.forEach(processId => {
        this.processingApi.export(processId).subscribe(((data: any) => {
          data.pias.forEach(pia => this.piaToExport.push(this.piaToCsv(pia, processId)))
          this.processingToExport.push(this.processingToCsv(data, parentFolder, processId))
        }));
      });
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
        this.folderToExport.push(this.folderToCsv(folderData))
        const folderIds = folderData.children.map(children => children.id)
        const ProcessingIds = folderData.processings.map(process => process.id)
        try {
          await this.getDataToExport(folderIds, ProcessingIds, folderData.id)
        } catch (e) {
          console.log(e)
          return Promise.reject(e);
        }
        return Promise.resolve();
      }));
    }
  }

  folderToCsv(folder): FolderCsvRow {
    return {
      id: folder.id,
      name: folder.name,
      path: folder.path,
      parentId: folder.parent.isRoot ? null : folder.parent.id,
      person_in_charge: folder.person_in_charge,
      structure_id: folder.structure_id,
    }
  }

  processingToCsv(processing, parentId, id): ProcessingCsvRow {
    return {
      id,
      name: processing.name,
      parentId,
      author: processing.author,
      consent: processing.consent,
      context_of_implementation: processing.context_of_implementation,
      controllers: processing.controllers,
      description: processing.description,
      designated_controller: processing.designated_controller,
      exactness: processing.exactness,
      life_cycle: processing.life_cycle,
      minimization: processing.minimization,
      non_eu_transfer: processing.non_eu_transfer,
      processors: processing.processors,
      standards: processing.standards,
      status: processing.status,
      storage: processing.storage,
      processing_data_types: JSON.stringify(processing.processing_data_types),
    }
  }

  piaToCsv(pia, processingId): PiaCsvRow {
    const answers = pia.answers.map(answer => {
      const sectionNumber = answer.reference_to.toString().substring(0, 1);
      const itemNumber = answer.reference_to.toString().substring(1, 2);
      const questionNumber = answer.reference_to.toString().substring(2, 3);
      return {
        question: this.translate.instant(`sections.${sectionNumber}.items.${itemNumber}.questions.${questionNumber}`),
        answer: answer.data
      }
    });

    return {
      processingId,
      author_name: pia.author_name,
      concerned_people_opinion: pia.concerned_people_opinion,
      concerned_people_searched_content: pia.concerned_people_searched_content,
      concerned_people_searched_opinion: pia.concerned_people_searched_opinion,
      concerned_people_status: pia.concerned_people_status,
      dpo_opinion: pia.dpo_opinion,
      dpo_status: pia.dpo_status,
      dpos_names: pia.dpos_names,
      evaluator_name: pia.evaluator_name,
      is_example: pia.is_example,
      number_of_questions: pia.number_of_questions,
      people_names: pia.people_names,
      progress: pia.progress,
      rejection_reason: pia.rejection_reason,
      status: pia.status,
      type: pia.type,
      validator_name: pia.validator_name,
      answers: JSON.stringify(answers)
    }
  }
}
