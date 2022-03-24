import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { PiaService } from '../../entry/pia.service';

import { ProcessingModel } from '@api/models';
import { ProcessingApi, UserApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';
import { ModalsService } from '../../modals/modals.service';

@Component({
  selector: 'app-card-item',
  templateUrl: './card-item.component.html',
  styleUrls: [
    './card-item.component.scss',
    './card-item_edit.component.scss',
    './card-item_doing.component.scss',
    './card-item_archived.component.scss'
  ],
})
export class CardItemComponent implements OnInit {
  @Input() processing: any;
  @Input() previousProcessing: any;
  processingForm: FormGroup;
  checked: boolean = false;
  @Output() onCheckChange: EventEmitter<any> = new EventEmitter();
  hasManageProcessingPermissions: boolean = false;
  hasProcessingUsers: boolean = true;
  allUsers: any;

  @ViewChild('processingName') private processingName: ElementRef;

  constructor(
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    private processingApi: ProcessingApi,
    private permissionsService: PermissionsService,
    private _userApi: UserApi,
    private i18n: TranslateService,
  ) {

  }

  ngOnInit() {
    this.processingForm = new FormGroup({
      id: new FormControl(this.processing.id),
      name: new FormControl({ value: this.processing.name, disabled: true }),
      redactor_id: new FormControl({ value: this.processing.supervisors.redactor_id ? this.processing.supervisors.redactor_id : undefined, disabled: true }),
      evaluator_id: new FormControl({ value: this.processing.supervisors.evaluator_pending_id ? this.processing.supervisors.evaluator_pending_id : undefined, disabled: true }),
      data_protection_officer_id: new FormControl({ value: this.processing.supervisors.data_protection_officer_pending_id ? this.processing.supervisors.data_protection_officer_pending_id : undefined , disabled: true }),
      data_controller_id: new FormControl({ value: this.processing.supervisors.data_controller_id ? this.processing.supervisors.data_controller_id : undefined, disabled: true })
    });

    // add permission verification
    const hasPerm$ = this.permissionsService.hasPermission('CanCreateProcessing');
    hasPerm$.then((bool: boolean) => {
      // tslint:disable-next-line:forin
      for (const field in this.processingForm.controls) {
          const fc = this.processingForm.get(field);
          bool ? fc.enable() : fc.disable();
      }
    });

    this.permissionsService.hasPermission('CanManageProcessingPermissions').then((bool: boolean) => this.hasManageProcessingPermissions = bool);

    this._userApi.getProcessingUsers(this.processing.id).subscribe(processingUsers => {
      if (processingUsers.length === 0) {
        this.hasProcessingUsers = false;
      }
    });
    const structureId = parseInt(localStorage.getItem('structure-id'), 10)
    this._userApi.getAll(structureId).subscribe(users => {
      this.allUsers = users;
      this.allUsers = this.allUsers.map(user => {
        const rolesLabel = [];
        user.roles.forEach(role => {
          rolesLabel.push(this.i18n.instant(`role_description.${role}.label`));
        })
        user.roles = rolesLabel.join('/');
        return user;
      });
    });
  }

  /**
   * Focuses processing name field.
   * @memberof CardItemComponent
   */
  processingNameFocusIn() {
    this.processingName.nativeElement.focus();
  }

  /**
   * Disables processing name field and saves data.
   * @memberof CardItemComponent
   */
  processingNameFocusOut() {
    let userText = this.processingForm.controls['name'].value;
    if (userText && typeof userText === 'string') {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.processingApi.get(this.processingForm.value.id).subscribe((theProcessing: ProcessingModel) => {
        theProcessing.name = this.processingForm.value.name;
        this.processingApi.update(theProcessing).subscribe();
      });
    }
  }

  /**
   * Disables pia redactor field and saves data.
   * @memberof CardItemComponent
   */
  processingRedactorChange() {
    this.processingApi.get(this.processingForm.value.id).subscribe((theProcessing: ProcessingModel) => {
      theProcessing.redactor_id = this.processingForm.value.redactor_id;
      this.processingApi.update(theProcessing).subscribe();
    });
  }

  /**
   * Disables pia evaluator field and saves data.
   * @memberof CardItemComponent
   */
  processingEvaluatorChange() {
    this.processingApi.get(this.processingForm.value.id).subscribe((theProcessing: ProcessingModel) => {
      theProcessing.evaluator_pending_id = this.processingForm.value.evaluator_id;
      this.processingApi.update(theProcessing).subscribe();
    });
  }

  /**
   * Disables pia data protection officer field and saves data.
   * @memberof CardItemComponent
   */
  processingDPOChange() {
    this.processingApi.get(this.processingForm.value.id).subscribe((theProcessing: ProcessingModel) => {
      theProcessing.data_protection_officer_pending_id = this.processingForm.value.data_protection_officer_id;
      this.processingApi.update(theProcessing).subscribe();
    });
  }

  /**
   * Disables pia data controller field and saves data.
   * @memberof CardItemComponent
   */
  processingDataControllerChange() {
    this.processingApi.get(this.processingForm.value.id).subscribe((theProcessing: ProcessingModel) => {
      theProcessing.data_controller_id = this.processingForm.value.data_controller_id;
      this.processingApi.update(theProcessing).subscribe();
    });
  }

  /**
   * Deletes a Processing with a given id.
   * @param {string} id - The Processing id.
   * @memberof CardItemComponent
   */
  removeProcessing(id: string) {
    localStorage.setItem('processing-id', id);
    this._modalsService.openModal('modal-remove-processing');
  }

  /**
   * Exports a Processing with a given id.
   * @param {number} id - The Processing id.
   * @memberof CardItemComponent
   */
  exportProcessing(id: number) {
    const date = new Date().getTime();

    this.processingApi.export(id).subscribe(((data) =>{
      const a = document.createElement('a');
      const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      const event = new MouseEvent('click', {view: window});

      a.setAttribute('href', url);
      a.setAttribute('download','pialab_processing_' + id + '_'+ date + '.json');
      a.dispatchEvent(event);
    }));
  }

  /**
   * Duplicates a Processing.
   * @memberof CardItemComponent
   */
  duplicateProcessing() {
    this.processingApi.import(this.processing.toJson(), this._piaService.currentFolder.id).subscribe((theProcessing: ProcessingModel) => {
      this._piaService.currentFolder.processings.push(theProcessing);
    });
  }

  toggleChecked(id) {
    this.onCheckChange.emit({id, checked: this.checked});
  }

  /**
   * Open the modal for the allocation of permissions for processings.
   * @memberof CardItemComponent
   */
  openPermissionsModal() {
    this._modalsService.openModal('modal-list-element-permissions', {elementId: this.processing.id, elementType: 'processing'})
  }
}
