import { Component, Input, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';

import { KnowledgeBaseService } from '../../entry/knowledge-base/knowledge-base.service';
import { RightsModel } from '@api/models';
import { RightsApi, ProcessingDataTypeApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';
import { RightsStatus, RightsEvaluationStates } from '@api/model/rights.model';


@Component({
  selector: 'app-rights-form',
  templateUrl: './rights-form.component.html',
  styleUrls: ['./rights-form.component.scss']
})
export class RightsFormComponent implements OnDestroy, OnInit {
  @Input() sections: any;
  @Input() rights: RightsModel;
  @Input() currentSection: any;
  @ViewChild('rightsForm') rightsForm: NgForm;
  editor: any;
  elementId: String;
  rightsFullyFilled: boolean = false;
  rightsStatus = RightsStatus;
  rightsEvaluationStates = RightsEvaluationStates;

  constructor(
    private rightsApi: RightsApi,
    private rightsDataTypeApi: ProcessingDataTypeApi,
    private ref: ChangeDetectorRef,
    private permissionsService: PermissionsService,
    private knowledgeBaseService: KnowledgeBaseService
  ) {
    this.knowledgeBaseService.knowledgeBaseData = [];
  }

  ngOnInit() {
    //this.isFullyFilled();
  }

  ngOnDestroy() {
    this.closeEditor();
  }

  /**
   * Update Rights model
   *
   * @param {boolean} dataTypes
   * @memberof RightsFormComponent
   */
  updateRights(dataTypes: boolean = false) {
    // this.isFullyFilled();

    // if (dataTypes) {
    //   return
    // };

    // this.rightsApi.update(this.rights).subscribe(() => { });
  }

  updateKnowledgeBase(slugs: string[]) {
    const item = {
      link_knowledge_base: slugs
    };
    this.knowledgeBaseService.loadByItem(item);
  }

  /**
   * Check permissions and open editor to edit field content
   *
   * @param {any} element
   * @param {string[]} knowledgeBaseItemIdentifier
   * @memberof RightsFormComponent
   */
  editField(element: any, knowledgeBaseItemIdentifier?: string[]) {
    this.permissionsService.hasPermission('CanEditRights').then((hasPerm: boolean) => {
      if (hasPerm) {
        this.elementId = element.id;

        this.loadEditor(element);
      }
      if (knowledgeBaseItemIdentifier) {
        this.updateKnowledgeBase(knowledgeBaseItemIdentifier);
      }

      //this.isFullyFilled();
    });
  }

  /**
   * Load wysiwyg editor.
   *
   * @private
   * @param element
   * @memberof RightsFormComponent
   */
  private loadEditor(element: any) {
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      plugins: 'autoresize lists',
      forced_root_block: false,
      autoresize_bottom_margin: 30,
      auto_focus: element.id,
      autoresize_min_height: 40,
      content_style: 'body {background-color:#eee!important;}',
      selector: '#' + element.id,
      toolbar: 'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin_url: 'assets/skins/lightgray',
      setup: editor => {
        this.editor = editor;

        editor.on('focusout', () => {
          const content = editor.getContent();

          this.rightsForm.form.controls[element.name].patchValue(content);

          this.closeEditor();
          this.updateRights();
          // Hack to trigger view update
          this.ref.detectChanges();
        });
      }
    });
  }

  /**
   * Close wysiwig editor
   *
   * @private
   * @memberof RightsFormComponent
   */
  private closeEditor() {
    tinymce.remove(this.editor);
    //this.isFullyFilled();
    this.editor = null;
  }

  protected isFullyFilled(): void {
    const fields = [
      'description',
      'controllers',
      'standards',
      'storage',
      'life_cycle',
      'processors',
      'non_eu_transfer',
      'recipients',
      'lawfulness',
      'minimization',
      'rights_guarantee',
      'exctness',
      'consent'
    ];

    let isFullyFilled = true;

    this.rightsDataTypeApi.getAll(this.rights.id).subscribe((rightsDataTypes) => {
      isFullyFilled = rightsDataTypes.length > 0;

      for (const field of fields) {
        if (
          this.rights.hasOwnProperty(field)
          && (
            this.rights[field] === null
            ||
            this.rights[field] === undefined
            ||
            this.rights[field] === ''
          )
        ) {
          isFullyFilled = false;
        }
      }

      this.rightsFullyFilled = isFullyFilled;
    });
  }

  protected askValidation(): void {
    this.rights.status = RightsStatus.STATUS_UNDER_VALIDATION;

    this.rightsApi.update(this.rights).subscribe((rights) => {
      this.rights = rights;
    });
  }

  protected cancelAskValidation(): void {
    this.rights.status = RightsStatus.STATUS_DOING;

    this.rightsApi.update(this.rights).subscribe((rights) => {
      this.rights = rights;
    });
  }

  public onProcessngUpdated(rights: RightsModel) {
    this.rights = rights;
    this.ref.detectChanges();
  }
}
