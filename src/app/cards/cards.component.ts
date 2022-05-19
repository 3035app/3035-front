import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { saveAs } from 'file-saver';
import * as Moment from 'moment';

import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';
import { environment } from 'environments/environment';

import { FolderModel, ProcessingModel, EvaluationModel } from '@api/models';
import { FolderApi, ProcessingApi, MeasureApi, EvaluationApi, PiaApi, AnswerApi, CommentApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';
import { ProfileSession } from '../services/profile-session.service';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from 'app/services/history.service';


interface FolderCsvRow {
  name: string;
  id: number;
  path: string;
  parent_id?: number;
  person_in_charge: string;
  structure_id: number;
}

interface ProcessingCsvRow {
  id: number;
  parent_id: number;
  parent_path: string;
  author: string;
  created_at: string;
  updated_at: string;
  concerned_people: string;
  context_of_implementation: string;
  controllers: string;
  description: string;
  designated_controller: string;
  exactness: string;
  lawfulness: string;
  life_cycle: string;
  minimization: string;
  name: string;
  non_eu_transfer: string;
  processors: string;
  standards: string;
  status: string;
  storage: string;
  processing_data_types: string;
  recipients: string;
  comments: string;
  informed_concerned_people: string,
  consent_concerned_people: string,
  access_concerned_people: string,
  delete_concerned_people: string,
  limit_concerned_people: string,
  subcontractors_obligations: string,
  trackings: any
}


interface PiaCsvRow {
  processing_id: number;
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
  created_at: Date;
  updated_at: Date;
}

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})

export class CardsComponent implements OnInit {
  newProcessing: ProcessingModel;
  processingForm: FormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string }
  view: 'card';
  folderId: number;
  itemToMove: any = null;
  folderToExport: FolderCsvRow[] = [];
  processingToExport: ProcessingCsvRow[] = [];
  piaToExport: PiaCsvRow[] = [];
  piaToExportOdt: any = [];
  exportIsLoading: boolean = false;
  canCreateProcessing: boolean;
  selectedFolder: any = [];
  selectedProcessing: any = [];
  public structure: any;
  private tenant: string;

  constructor(
    private route: ActivatedRoute,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    private measureApi: MeasureApi,
    private piaApi: PiaApi,
    private evaluationApi: EvaluationApi,
    private permissionsService: PermissionsService,
    private processingApi: ProcessingApi,
    private folderApi: FolderApi,
    private answerApi: AnswerApi,
    private session: ProfileSession,
    private translate: TranslateService,
    private commentApi: CommentApi,
    private _historyService: HistoryService,
  ) {
    this.tenant = environment.tenant;
   }

  ngOnInit() {
    this.structure = this.session.getCurrentStructure();
    this.permissionsService.hasPermission('CanCreateProcessing').then((bool: boolean) => {
      this.canCreateProcessing = bool;
    });
    this.applySortOrder();
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

  geth1Title(title: string) {
    return `<h1>${title}</h1>`
  }

  geth2Title(title: string) {
    return `<h2>${title}</h2>`
  }

  geth3Title(title: string) {
    return ` <h3>${title}</h3>`
  }

  geth4Title(title: string) {
    return ` <h4>${title}</h4>`
  }

  getBorderedP(content: string) {
    return `<p style="border: 1px solid #a7a7a7; padding: 0.24cm 0.32cm;">${content}</p>`
  }

  getP(content: string) {
    return `<p>${content}</p>`
  }

  getBorderedEvaluation(evaluation: string, comment: string = null) {
    return `<p style="border: 1px dotted #a7a7a7; padding: 0.24cm 0.32cm;>
        Evaluation: ${evaluation}
        ${comment ? `<br/>Evaluation comment: ${comment}` : ''}
    </p>`
  }

  getProcessingDataTypes(dataTypes, duration = true, translation = 'processing-data-types') {
    if (!dataTypes) { return''; }
    let processingDataTypes = ``;

    dataTypes.forEach(type =>
      processingDataTypes += this.getP(`
      <p>- ${this.translate.instant(`${translation}.form.${type.reference}`)}</p>
      <p>
        <span>${duration ? `${this.translate.instant(`processing-data-types.form.retention-period`)}: ${type.retention_period} (${type.sensitive ? this.translate.instant(`processing-data-types.form.sensitive-affirmative`) : ''})` : ''}</span>
      </p>
      ${type.data ? `<p>${type.data}</p>` : ''}
      `)
      )

    return processingDataTypes;
  }

  getProcessingComments(comments, field?) {
    let processingComments = `<p>Commentaires :</p>`;
    let hasComment = false;

    JSON.parse(comments).forEach(comment => {
      if (comment.field === field) {
        hasComment = true;
        if (comment.commented_by && comment.commented_by.roles) {
          const rolesLabel = [];
          comment.commented_by.roles.forEach(role => {
            rolesLabel.push(this.translate.instant(`role_description.${role}.label`));
          })
        comment.commented_by.rolesLabel = rolesLabel.join('/');
        }
        const date = comment.created_at && new Date(comment.created_at);
        processingComments += `<p>Commentaire ${date && date.toLocaleDateString()} | ${this.translate.instant(`history.created_by`)} ${comment.commented_by.firstName}  | ${comment.commented_by.rolesLabel}</p><p>${comment.content}</p>`
      }
    });
    if (hasComment) {
      return processingComments;
    }
    return '';
  }

  getPiaComments(comments) {
    let piaComments = `<p>Commentaires :</p>`;
    comments.forEach(comment => {
      if (comment.commented_by && comment.commented_by.roles) {
        const rolesLabel = [];
        comment.commented_by.roles.forEach(role => {
          rolesLabel.push(this.translate.instant(`role_description.${role}.label`));
        })
      comment.commented_by.rolesLabel = rolesLabel.join('/');
      }
      const date = comment.created_at && new Date(comment.created_at);
      piaComments += `<p>Commentaire ${date && date.toLocaleDateString()} | ${this.translate.instant(`history.created_by`)} ${comment.commented_by.firstName}  | ${comment.commented_by.rolesLabel}</p><p>${comment.description}</p>`
    });
    return piaComments;
  }

  getPiaInformation(data) {
    let piaInformations = `${this.geth2Title(this.translate.instant('summary.title'))}`;

    if (data.name && data.name.length > 0) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.pia_name'))}
      ${this.getBorderedP(data.name)}
      `;
    }
    if (data.author_name && data.author_name.length > 0) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.pia_author'))}
      ${this.getBorderedP(data.author_name)}
      `;
    }
    if (data.evaluator_name && data.evaluator_name.length > 0) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.pia_assessor'))}
      ${this.getBorderedP(data.evaluator_name)}
      `;
    }
    if (data.validator_name && data.validator_name.length > 0) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.pia_validator'))}
      ${this.getBorderedP(data.validator_name)}
      `;
    }
    if (data.created_at) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.creation_date'))}
      ${this.getBorderedP(Moment(data.created_at).format(environment.date_format))}
      `;
    }
    if (data.dpos_names && data.dpos_names.length > 0) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.dpo_name'))}
      ${this.getBorderedP(data.dpos_names)}
      `;
    }
    if (data.dpo_status && data.dpo_status.length > 0) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.dpo_status'))}
      ${this.getBorderedP(this.translate.instant(this._piaService.getOpinionsStatus(data.dpo_status.toString())))}
      `;
    }
    if (data.dpo_opinion && data.dpo_opinion.length > 0) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.dpo_opinion'))}
      ${this.getBorderedP(data.dpo_opinion)}
      `;
    }

    // Searched opinion for concerned people
    if (data.concerned_people_searched_opinion === true) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.concerned_people_searched_opinion'))}
      ${this.getBorderedP(this.translate.instant(this._piaService.getPeopleSearchStatus(data.concerned_people_searched_opinion)))}
      `;
      if (data.people_names && data.people_names.length > 0) {
        piaInformations += `
        ${this.geth3Title(this.translate.instant('summary.concerned_people_name'))}
        ${this.getBorderedP(data.people_names)}
        `;
      }
      if (data.concerned_people_status >= 0) {
        piaInformations += `
        ${this.geth3Title(this.translate.instant('summary.concerned_people_status'))}
        ${this.getBorderedP(this.translate.instant(this._piaService.getOpinionsStatus(data.concerned_people_status.toString())))}
        `;
      }
      if (data.concerned_people_opinion && data.concerned_people_opinion.length > 0) {
        piaInformations += `
        ${this.geth3Title(this.translate.instant('summary.pia_author'))}
        ${this.getBorderedP(data.author_name)}
        `;
      }
    }

    // Unsearched opinion for concerned people
    if (data.concerned_people_searched_opinion === false) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.concerned_people_searched_opinion'))}
      ${this.getBorderedP(this.translate.instant(this._piaService.getPeopleSearchStatus(data.concerned_people_searched_opinion)))}
      `;
      if (data.concerned_people_searched_content && data.concerned_people_searched_content.length > 0) {
        piaInformations += `
        ${this.geth3Title(this.translate.instant('summary.concerned_people_unsearched_opinion_comment'))}
        ${this.getBorderedP(data.concerned_people_searched_content)}
        `;
      }
    }

    if (data.applied_adjustments && data.applied_adjustments.length > 0) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.modification_made'))}
      ${this.getBorderedP(data.applied_adjustments)}
      `;
    }
    if (data.rejection_reason && data.rejection_reason.length > 0) {
      piaInformations += `
      ${this.geth3Title(this.translate.instant('summary.rejection_reason'))}
      ${this.getBorderedP(data.rejection_reason)}
      `;
    }
    return piaInformations;
  }

  getProcessing(data: ProcessingCsvRow) {
    if (!data) { return '' }

    const history = this._historyService.getFormatedHistory(data.trackings);

    return `
      ${this.geth1Title(this.translate.instant('summary.pia')+' "'+data.name+'"')}
      
      ${this.getP(data.updated_at)}
      ${this.getP(this.translate.instant('processing.path')+': '+data.parent_path)}

      ${this.geth2Title(this.translate.instant('processing.form.sections.description.title'))}
      
      ${this.geth3Title(this.translate.instant('processing.form.context_of_implementation.title'))}
      ${this.getP(data.context_of_implementation)}
      ${this.getProcessingComments(data.comments, 'context')}
      
      ${this.geth3Title(this.translate.instant('processing.form.controllers.title'))}
      ${this.getP(data.controllers)}
      ${this.getProcessingComments(data.comments, 'controllers')}
      
      ${this.geth3Title(this.translate.instant('processing.form.standards.title'))}
      ${this.getP(data.standards)}
      ${this.getProcessingComments(data.comments, 'standards')}
      
      ${this.geth2Title(this.translate.instant('processing.form.sections.data.title'))}
      
      ${this.geth3Title(this.translate.instant('processing.form.data-types'))}
      ${this.getProcessingDataTypes(JSON.parse(data.processing_data_types))}
      ${this.getProcessingComments(data.comments, 'data-types')}

      ${this.geth3Title(this.translate.instant('processing.form.lifecycle.title'))}
      ${this.getP(data.life_cycle)}
      ${this.getProcessingComments(data.comments, 'lifecycle')}

      ${this.geth3Title(this.translate.instant('processing.form.storage.title'))}
      ${this.getP(data.storage)}
      ${this.getProcessingComments(data.comments, 'storage')}

      ${this.geth3Title(this.translate.instant('processing.form.concerned_people.title'))}
      ${this.getP(data.concerned_people)}
      ${this.getProcessingComments(data.comments, 'concerned_people')}

      ${this.geth3Title(this.translate.instant('processing.form.processors.title'))}
      ${this.getP(data.processors)}
      ${this.getProcessingComments(data.comments, 'processors')}

      ${this.geth3Title(this.translate.instant('processing.form.recipients.title'))}
      ${this.getP(data.recipients)}
      ${this.getProcessingComments(data.comments, 'recipients')}

      ${this.geth2Title(this.translate.instant('processing.form.sections.lifecycle.title'))}

      ${this.geth3Title(this.translate.instant('processing.form.description.title'))}
      ${this.getP(data.description)}
      ${this.getProcessingComments(data.comments, 'description')}
      
      ${this.geth3Title(this.translate.instant('processing.form.lawfulness.title'))}
      ${this.getP(data.lawfulness)}
      ${this.getProcessingComments(data.comments, 'lawfulness')}

      ${this.geth3Title(this.translate.instant('processing.form.minimization.title'))}
      ${this.getP(data.minimization)}
      ${this.getProcessingComments(data.comments, 'minimization')}

      ${this.geth3Title(this.translate.instant('processing.form.exactness.title'))}
      ${this.getP(data.exactness)}
      ${this.getProcessingComments(data.comments, 'exactness')}

      ${this.geth2Title(this.translate.instant('processing.form.sections.measures.title'))}

      ${this.geth3Title(this.translate.instant('processing.form.informed_concerned_people'))}
      ${this.getProcessingDataTypes(JSON.parse(data.informed_concerned_people), false, 'processing_informed_concerned_people')}
      ${this.getProcessingComments(data.comments, 'informed_concerned_people')}

      ${this.geth3Title(this.translate.instant('processing.form.consent_concerned_people'))}
      ${this.getProcessingDataTypes(JSON.parse(data.consent_concerned_people), false, 'processing_consent_concerned_people')}
      ${this.getProcessingComments(data.comments, 'consent_concerned_people')}

      ${this.geth3Title(this.translate.instant('processing.form.access_concerned_people'))}
      ${this.getProcessingDataTypes(JSON.parse(data.access_concerned_people), false, 'processing_access_concerned_people')}
      ${this.getProcessingComments(data.comments, 'access_concerned_people')}

      ${this.geth3Title(this.translate.instant('processing.form.delete_concerned_people'))}
      ${this.getProcessingDataTypes(JSON.parse(data.delete_concerned_people), false, 'processing_delete_concerned_people')}
      ${this.getProcessingComments(data.comments, 'delete_concerned_people')}

      ${this.geth3Title(this.translate.instant('processing.form.limit_concerned_people'))}
      ${this.getProcessingDataTypes(JSON.parse(data.limit_concerned_people), false, 'processing_limit_concerned_people')}
      ${this.getProcessingComments(data.comments, 'limit_concerned_people')}

      ${this.geth3Title(this.translate.instant('processing.form.subcontractors_obligations'))}
      ${this.getProcessingDataTypes(JSON.parse(data.subcontractors_obligations), false, 'processing_subcontractors_obligations')}
      ${this.getProcessingComments(data.comments, 'subcontractors_obligations')}

      ${this.geth3Title(this.translate.instant('processing.form.non-eu-transfer.title'))}
      ${this.getP(data.non_eu_transfer)}
      ${this.getProcessingComments(data.comments, 'non-eu-transfer')}

      ${this.geth2Title(this.translate.instant('history.title'))}
      
      ${this.getP(this.translate.instant('history.created_by') + ' ' + history.createdBy + ' ' + this.translate.instant('history.on') + ' ' + history.createdOn)}
      ${this.getP(this.translate.instant('history.last_modification_by') + ' ' + history.updatedBy + ' ' + this.translate.instant('history.on') + ' ' + history.updatedOn)}
      ${this.getP(this.translate.instant('history.ask_evaluation_by') + ' ' + history.evaluationRequestedBy + ' ' + this.translate.instant('history.on') + ' ' + history.evaluationRequestedOn)}
      ${this.getP(this.translate.instant('history.evaluated_by') + ' ' + history.evaluatedBy + ' ' + this.translate.instant('history.on') + ' ' + history.evaluatedOn)}
      ${this.getP(this.translate.instant('history.ask_opinion_by') + ' ' + history.issueRequestedBy + ' ' + this.translate.instant('history.on') + ' ' + history.issueRequestedOn)}
      ${this.getP(this.translate.instant('history.opinion_by') + ' ' + history.noticedBy + ' ' + this.translate.instant('history.on') + ' ' + history.noticedOn)}
      ${this.getP(this.translate.instant('history.ask_validation_by') + ' ' + history.validationRequestedBy + ' ' + this.translate.instant('history.on') + ' ' + history.validationRequestedOn)}
      ${this.getP(this.translate.instant('history.validated_by') + ' ' + history.validatedBy + ' ' + this.translate.instant('history.on') + ' ' + history.validatedOn)}

    `;
  }

  async getRisks(data) {
    if (!data) {return''};
    let risks = `${this.geth2Title(this.translate.instant('sections.3.title'))}`;
    await Promise.all(this._piaService.data.sections.map(async (section) => {

      // Taking risks section 3 only
      if (section.id === 3) {
        await Promise.all(section.items.map(async (item) => {
          const ref = section.id.toString() + '.' + item.id.toString();
          let currentRiskSection = ``;
          // Measure
          if (item.is_measure) {
              const entries: any = await this.measureApi.getAll(data.id).toPromise();
              currentRiskSection += `${this.geth3Title(this.translate.instant(item.title))} <br/>`;

              await Promise.all(entries.map(async (measure) => {
                /* Completed measures */
                if (measure.title !== undefined && measure.content !== undefined) {
                  let evaluation = null;
                  if (item.evaluation_mode === 'question') {
                    evaluation = await this.getEvaluation(section.id, item.id, ref + '.' + measure.id, data.id);
                  }

                  currentRiskSection += `${this.geth4Title(measure.title)}`
                  currentRiskSection += `${this.getP(measure.content)}`

                  const comments = await this.commentApi.getAllByRef(data.id, measure.id).toPromise();
                  currentRiskSection += `${this.getPiaComments(comments)}`;
                  if(evaluation) {
                    currentRiskSection += `${this.getBorderedEvaluation(this.translate.instant(evaluation.title), evaluation.evaluation_comment)}`
                  }
                }
              }));
          } else if (item.questions) { // Question
            currentRiskSection += `${this.geth3Title(this.translate.instant(item.title))} <br/>`;
            await Promise.all( item.questions.map(async (question) => {
              const answerModel = await this.answerApi.getByRef(data.id, question.id).toPromise();
              const comments = await this.commentApi.getAllByRef(data.id, question.id).toPromise();
              currentRiskSection += `${this.geth4Title(this.translate.instant(question.title))}`
              
              /* An answer exists */
              if (answerModel && answerModel.data) {
                const content = [];
                if (answerModel.data.gauge && answerModel.data.gauge > 0) {
                  content.push(this.translate.instant(this._piaService.getGaugeLabel(answerModel.data.gauge)));
                }
                if (answerModel.data.text && answerModel.data.text.length > 0) {
                  content.push(answerModel.data.text);
                }
                if (answerModel.data.list && answerModel.data.list.length > 0) {
                  content.push(answerModel.data.list.join(', '));
                }
                if (content.length > 0) {
                  currentRiskSection += `${this.getP(content.join(', '))}`
                  if (item.evaluation_mode === 'question') {
                    const evaluation: any = await this.getEvaluation(section.id, item.id, ref + '.' + question.id, data.id);

                    if(evaluation) {
                      currentRiskSection += `${this.getBorderedEvaluation(this.translate.instant(evaluation.title), evaluation.evaluation_comment)}`
                    }
                  }
                }
                if (comments.length > 0) {
                  currentRiskSection += `${this.getPiaComments(comments)}`;
                }
              }
            }));
          }
          if (item.evaluation_mode === 'item') {
            const evaluation: any = await this.getEvaluation(section.id, item.id, ref, data.id);

            if(evaluation) {
              currentRiskSection += `${this.getBorderedEvaluation(this.translate.instant(evaluation.title), evaluation.evaluation_comment)}`
            }
          }
          risks += currentRiskSection
        }));
      }
    }));

    return risks;
  }

  async exportLibreOffice() {
    if (this.selectedFolder.length === 0 && this.selectedProcessing.length === 0) {
      return;
    }

    this.exportIsLoading = true;
    this.folderToExport = [];
    this.processingToExport = [];
    this.piaToExportOdt = [];

    this.selectedProcessing.forEach((process, index) => {
      this._piaService.processings.forEach((processing) => {
        if (processing.id === process && !processing.can_show) {
          this.selectedProcessing.splice(index, 1);
        }
      })
    })

    try {
      await this.getDataToExport(this.selectedFolder, this.selectedProcessing)
    } catch (e) {
      console.log(e)
    }

    let fileData = '';

    // dirty fix
    this.processingToExport.forEach((processing) => {
      fileData += `${this.getProcessing(processing)}`
    });

    await Promise.all(this.piaToExportOdt.map(async pia => {
      const risks = await this.getRisks(pia)
      fileData += `
      <br/>
      <br/>

      ${this.getPiaInformation(pia)}

      ${risks}

        ${this.geth3Title('Action Plan')}
        ${this.geth4Title('Fundamental principles')}
        ${this.getBorderedP('No action plan recorded.')}
        ${this.geth4Title('Existing or planned measures')}
        ${this.getBorderedP('No action plan recorded.')}
        ${this.geth4Title('Risks')}
        ${this.getBorderedP('No action plan recorded.')}
      `;
      return Promise.resolve();
    }))

    const mime = 'application/vnd.oasis.opendocument.text';
    const blob = new Blob([`
      <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
        <title>Action plan</title>
      </head>


      <body lang="en-GB" dir="ltr">
        ${fileData}
      </body>`], {type: mime});

    saveAs(blob, 'Processing-DPIA.odt')
    this.exportIsLoading = false;
  }

  async exportCsv() {
    if (this.selectedFolder.length === 0 && this.selectedProcessing.length === 0) {
      return;
    }

    this.exportIsLoading = true;
    this.folderToExport = [];
    this.processingToExport = [];

    try {
      await this.getDataToExport(this.selectedFolder, this.selectedProcessing)
    } catch (e) {
      console.log(e)
    }

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
        'parent_id',
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
        'parent_id',
        'parent_path',
        'author',
        'created_at',
        'updated_at',
        'context_of_implementation',
        'controllers',
        'standards',
        'processing_data_types',
        'life_cycle',
        'storage',
        'concerned_people',
        'processors',
        'recipients',
        'description',
        'lawfulness',
        'minimization',
        'exactness',
        'informed_concerned_people',
        'consent_concerned_people',
        'access_concerned_people',
        'delete_concerned_people',
        'limit_concerned_people',
        'subcontractors_obligations',
        'non_eu_transfer',
        'designated_controller',
        'status',
        'comments'
      ]
    }

    new Angular5Csv(this.processingToExport, 'processing', optionsProcess)

    const piaHeaders =  [
      'processing_id',
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
      'answers',
      'created_at'
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

    this.exportIsLoading = false;
  }

  /**
   * Get an evaluation by reference.
   * @private
   * @param {string} section_id - The section id.
   * @param {string} item_id - The item id.
   * @param {string} ref - The reference.
   * @returns {Promise}
   * @memberof SummaryComponent
   */
  private async getEvaluation(section_id: string, item_id: string, ref: string, piaId: number) {
    return new Promise(async (resolve, reject) => {
      let evaluation = null;

      this.evaluationApi.getByRef(piaId, ref).subscribe((theEval: EvaluationModel) => {
        if (theEval) {
          evaluation = {
            'title': theEval.getStatusLabel(),
            'action_plan_comment': theEval.action_plan_comment,
            'evaluation_comment': theEval.evaluation_comment,
            'gauges': {
              'riskName': { value: this.translate.instant('sections.' + section_id + '.items.' + item_id + '.title') },
              'seriousness': theEval.gauges ? theEval.gauges.x : null,
              'likelihood': theEval.gauges ? theEval.gauges.y : null
            }
          };
        }
        resolve(evaluation);
      });
    });
  }

  async getDataToExport(folder, processing, parentFolder = null) {
    if (processing && Array.isArray(processing) && processing.length > 0) {
      await Promise.all(processing.map(async processId => {
        const data: any = await this.processingApi.export(processId).toPromise();
        // pia for csv
        await Promise.all(data.pias.map(pia => this.piaToExport.push(this.piaToCsv(pia, processId))));

        // pia for odt
        const pias = await this.piaApi.getAll({'processing' : processId}).toPromise();
        await Promise.all(pias.map(pia => this.piaToExportOdt.push(this.piaToOdt(pia))));
        this.processingToExport.push(this.processingToCsv(data, parentFolder, processId))
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
        this.folderToExport.push(this.folderToCsv(folderData))
        const folderIds = folderData.children.map(children => children.id)
        const ProcessingIds = [];
        folderData.processings.forEach(process => {
          if (process.can_show) {
            ProcessingIds.push(process.id);
          }
        })
        try {
          await this.getDataToExport(folderIds, ProcessingIds, folderData)
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
      parent_id: folder.parent.isRoot ? null : folder.parent.id,
      person_in_charge: folder.person_in_charge,
      structure_id: folder.structure_id,
    }
  }

  processingToCsv(processing, parent, id): ProcessingCsvRow {
    const processing_data_types = processing.processing_data_types.filter(data => data.reference === 'identification' || data.reference === 'personal' || data.reference === 'professional' || data.reference === 'financial' || data.reference === 'log' || data.reference === 'location' || data.reference === 'internet' || data.reference === 'nir' || data.reference === 'other');
    const informed_concerned_people = processing.processing_data_types.filter(data => data.reference === 'informed_mention_form' || data.reference === 'informed_mention_contract' || data.reference === 'informed_terms' || data.reference === 'informed_display' || data.reference === 'informed_phone' || data.reference === 'informed_other');
    const consent_concerned_people = processing.processing_data_types.filter(data => data.reference === 'consent_optin_website' || data.reference === 'consent_optin_user_space' || data.reference === 'consent_phone' || data.reference === 'consent_paper' || data.reference === 'consent_signing_paper_form' || data.reference === 'consent_signing_contract' || data.reference === 'consent_signing_standard_form' || data.reference === 'consent_other');
    const access_concerned_people = processing.processing_data_types.filter(data => data.reference === 'access_contact_dpo' || data.reference === 'access_contact_referent' || data.reference === 'access_customer_area_form' || data.reference === 'access_paper_form' || data.reference === 'access_other');
    const delete_concerned_people = processing.processing_data_types.filter(data => data.reference === 'delete_contact_dpo' || data.reference === 'delete_contact_referent' || data.reference === 'delete_customer_area_form' || data.reference === 'delete_paper_form' || data.reference === 'delete_other');
    const limit_concerned_people = processing.processing_data_types.filter(data => data.reference === 'limit_contact_dpo' || data.reference === 'limit_contact_referent' || data.reference === 'limit_customer_area_form' || data.reference === 'limit_paper_form' || data.reference === 'limit_other');
    const subcontractors_obligations = processing.processing_data_types.filter(data => data.reference === 'subcontractors_obligations_yes' || data.reference === 'subcontractors_obligations_no' || data.reference === 'subcontractors_obligations_partially');
    return {
      id: id,
      name: processing.name,
      parent_id: parent ? parent.id : null,
      parent_path: parent ? parent.path.replace('/root/','/') : '/',
      author: processing.author,
      created_at: processing.created_at,
      updated_at: processing.updated_at,
      context_of_implementation: processing.context_of_implementation,
      controllers: processing.controllers,
      standards: processing.standards,
      processing_data_types: JSON.stringify(processing_data_types),
      life_cycle: processing.life_cycle,
      storage: processing.storage,
      concerned_people: processing.concerned_people,
      processors: processing.processors,
      recipients: processing.recipients,
      description: processing.description,
      lawfulness: processing.lawfulness,
      minimization: processing.minimization,
      exactness: processing.exactness,
      informed_concerned_people: JSON.stringify(informed_concerned_people),
      consent_concerned_people: JSON.stringify(consent_concerned_people),
      access_concerned_people: JSON.stringify(access_concerned_people),
      delete_concerned_people: JSON.stringify(delete_concerned_people),
      limit_concerned_people: JSON.stringify(limit_concerned_people),
      subcontractors_obligations: JSON.stringify(subcontractors_obligations),
      non_eu_transfer: processing.non_eu_transfer,
      designated_controller: processing.designated_controller,
      status: processing.status,
      comments: JSON.stringify(processing.comments),
      trackings: processing.trackings
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
      processing_id: processingId,
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
      answers: JSON.stringify(answers),
      created_at: pia.created_at,
      updated_at: pia.updated_at
    }
  }

  piaToOdt(pia): any {

    return {
      id: pia.id,
      processing: pia.processing,
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
      created_at: pia.created_at,
      updated_at: pia.updated_at
    }
  }
}
