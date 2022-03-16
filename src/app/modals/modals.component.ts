import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { ModalsService } from './modals.service';
import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { PiaService } from 'app/entry/pia.service';
import { AttachmentsService } from 'app/entry/attachments/attachments.service';

import { PiaModel, FolderModel, ProcessingModel } from '@api/models';
import { PiaApi, FolderApi, ProcessingApi, ProcessingAttachmentApi, UserApi } from '@api/services';
import { AttachmentsService as ProcessingAttachmentsService } from 'app/processing/attachments/attachments.service';
import { PiaType } from '@api/model/pia.model';


@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss'],
  providers: []
})
export class ModalsComponent implements OnInit {
  @Input() pia: any;
  newPia: PiaModel;
  newProcessing: ProcessingModel;
  newFolder: FolderModel;
  piaForm: FormGroup;
  processingForm: FormGroup;
  folderForm: FormGroup;
  removeAttachmentForm: FormGroup;
  enableSubmit = true;
  piaTypes: any;
  selectedUser: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    public _processingApi: ProcessingApi,
    public _measuresService: MeasureService,
    public _attachmentsService: AttachmentsService,
    private piaApi: PiaApi,
    public processingAttachmentApi: ProcessingAttachmentApi,
    public processingAttachmentsService: ProcessingAttachmentsService,
    public _folderApi: FolderApi,
    private userApi: UserApi
  ) {}

  ngOnInit() {
    this.piaForm = new FormGroup({
      author_id: new FormControl(),
      evaluator_id: new FormControl(),
      validator_id: new FormControl(),
      type: new FormControl()
    });
    
    this.processingForm = new FormGroup({
      name: new FormControl(),
      author_id: new FormControl(),
      designated_controller_id: new FormControl(),
      evaluator_id: new FormControl(),
      validator_id: new FormControl()
    });
    if (this.route.snapshot.data.processing) {
      this.piaForm.setValue({author_id: this.route.snapshot.data.processing.author_id ? this.route.snapshot.data.processing.author_id : '', evaluator_id: this.route.snapshot.params.evaluator_id && this.route.snapshot.params.evaluator_id !== 'null' ? this.route.snapshot.params.evaluator_id : '', validator_id: this.route.snapshot.params.validator_id && this.route.snapshot.params.validator_id !== 'null' ? this.route.snapshot.params.validator_id : '', type: 'advanced'});
    }

    this.folderForm = new FormGroup({
      name: new FormControl(),
    });

    this.removeAttachmentForm = new FormGroup({
      comment: new FormControl()
    });

    this.newPia = new PiaModel();
    this.newFolder = new FolderModel();
    this.newProcessing = new ProcessingModel();

    this.piaTypes = Object.values(PiaType);
  }

  /**
   * Returns to homepage (used on several modals).
   * @memberof ModalsComponent
   */
  returnToHomepage() {
    this._modalsService.closeModal();
    this.router.navigate(['/home']);
  }

  /**
   * Save the newly created PIA.
   * Sends to the path associated to this new PIA.
   * @memberof ModalsComponent
   */
  onSubmit() {
    const pia = new PiaModel();
    pia.author_id = this.piaForm.value.author_id;
    pia.evaluator_id = this.piaForm.value.evaluator_id;
    pia.validator_id = this.piaForm.value.validator_id;
    // disable the type feature
    pia.type = 'advanced';
    pia.processing = this._piaService.currentProcessing;

    this.piaApi.create(pia).subscribe((newPia: PiaModel) => {
      this.piaForm.reset();
      this.router.navigate(['entry', newPia.id, 'section', 3, 'item', 1]);
    });
  }

  /**
   * Save the newly created Processing.
   * Sends to the path associated to this new Processing.
   * @memberof ModalsComponent
   */
  onSubmitProcessing() {
    const processing = new ProcessingModel();
    processing.name = this.processingForm.value.name;
    processing.author_id = this.processingForm.value.author_id;
    processing.designated_controller_id = this.processingForm.value.designated_controller_id;
    console.log(processing);

    // this._processingApi.create(processing, this._piaService.currentFolder).subscribe((newProcessing: ProcessingModel) => {
    //   newProcessing.can_show = true;
    //   this.piaForm.reset();
    //   this.router.navigate(['processing', newProcessing.id, {evaluator_id: this.processingForm.value.evaluator_id, validator_id: this.processingForm.value.validator_id}]);
    // });
  }

  /**
   * Save the newly created PIA.
   * Sends to the path associated to this new PIA.
   * @memberof ModalsComponent
   */
  onSubmitFolder() {
    const folder = new FolderModel();
    folder.name = this.folderForm.value.name;
    folder.parent = this._piaService.currentFolder;
    folder.structure_id = folder.parent.structure_id;

    this._folderApi.create(folder).subscribe((newFolder: FolderModel) => {
      newFolder.can_access = true;
      this._modalsService.closeModal();
      this.folderForm.reset();
      this._piaService.currentFolder.children.push(newFolder);
    });
  }

  /**
   * Focuses out from the comment attachment field.
   * @memberof ModalsComponent
   */
  attachmentCommentFocusOut() {
    if (this.removeAttachmentForm.controls['comment'].value &&
        this.removeAttachmentForm.controls['comment'].value.length > 0) {
      this.enableSubmit = false;
    }
  }

  protected fetchElementUsers() {
    if (this._modalsService.data.elementType === 'folder') {
      return this.userApi.getFolderUsers(this._modalsService.data.elementId).toPromise();
    }
    if (this._modalsService.data.elementType === 'processing') {
      return this.userApi.getProcessingUsers(this._modalsService.data.elementId).toPromise();
    }
  }

  /**
   * Attaches a user to element on change select (modal for allocation of permissions for folders and processings).
   * @memberof ModalsComponent
   */
  onChangeSelectUser() {
    if (this.selectedUser) {
      if (this._modalsService.data.elementType === 'folder') {
        const folder = new FolderModel();
        this._folderApi.updateFolderUser(this._modalsService.data.elementId, this.selectedUser, folder).subscribe(async () => {
          this.selectedUser = null;
          this._modalsService.data.elementUsers = await this.fetchElementUsers()
        });
      }
      if (this._modalsService.data.elementType === 'processing') {
        const processing = new ProcessingModel();
        this._processingApi.updateProcessingUser(this._modalsService.data.elementId, this.selectedUser, processing).subscribe(async () => {
          this.selectedUser = null;
          this._modalsService.data.elementUsers = await this.fetchElementUsers()
        });
      }
    }
  }

  /**
   * Detach a user from an element on trash click (modal for allocation of permissions for folders and processings).
   * @memberof ModalsComponent
   */
  onDeleteElementUser(userId) {
    if (this._modalsService.data.elementType === "folder") {
      const folder = new FolderModel();
      this._folderApi.deleteFolderUser(this._modalsService.data.elementId, userId, folder).subscribe(async () => {
        this._modalsService.data.elementUsers = await this.fetchElementUsers()
      });
    }
    if (this._modalsService.data.elementType === "processing") {
      const processing = new ProcessingModel();
      this._processingApi.deleteProcessingUser(this._modalsService.data.elementId, userId, processing).subscribe(async () => {
        this._modalsService.data.elementUsers = await this.fetchElementUsers()
      });
    }
  }
}
