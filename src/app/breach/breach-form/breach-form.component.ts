import { Component, Input, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';

import { KnowledgeBaseService } from '../../entry/knowledge-base/knowledge-base.service';
import { BreachModel } from '@api/models';
import { BreachApi, ProcessingDataTypeApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';
import { BreachStatus, BreachEvaluationStates } from '@api/model/breach.model';


@Component({
  selector: 'app-breach-form',
  templateUrl: './breach-form.component.html',
  styleUrls: ['./breach-form.component.scss']
})
export class BreachFormComponent implements OnDestroy, OnInit {
  @Input() sections: any;
  @Input() breach: BreachModel;
  @Input() currentSection: any;
  @ViewChild('breachForm') breachForm: NgForm;
  editor: any;
  elementId: String;
  breachFullyFilled: boolean = false;
  breachStatus = BreachStatus;
  breachEvaluationStates = BreachEvaluationStates;

  constructor(
    private breachApi: BreachApi,
    private breachDataTypeApi: ProcessingDataTypeApi,
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
   * Update Breach model
   *
   * @param {boolean} dataTypes
   * @memberof BreachFormComponent
   */
  updateBreach(dataTypes: boolean = false) {
    // this.isFullyFilled();

    // if (dataTypes) {
    //   return
    // };

    // this.breachApi.update(this.breach).subscribe(() => { });
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
   * @memberof BreachFormComponent
   */
  editField(element: any, knowledgeBaseItemIdentifier?: string[]) {
    this.permissionsService.hasPermission('CanEditBreach').then((hasPerm: boolean) => {
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
   * @memberof BreachFormComponent
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

          this.breachForm.form.controls[element.name].patchValue(content);

          this.closeEditor();
          this.updateBreach();
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
   * @memberof BreachFormComponent
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

    this.breachDataTypeApi.getAll(this.breach.id).subscribe((breachDataTypes) => {
      isFullyFilled = breachDataTypes.length > 0;

      for (const field of fields) {
        if (
          this.breach.hasOwnProperty(field)
          && (
            this.breach[field] === null
            ||
            this.breach[field] === undefined
            ||
            this.breach[field] === ''
          )
        ) {
          isFullyFilled = false;
        }
      }

      this.breachFullyFilled = isFullyFilled;
    });
  }

  protected askValidation(): void {
    this.breach.status = BreachStatus.STATUS_UNDER_VALIDATION;

    this.breachApi.update(this.breach).subscribe((breach) => {
      this.breach = breach;
    });
  }

  protected cancelAskValidation(): void {
    this.breach.status = BreachStatus.STATUS_DOING;

    this.breachApi.update(this.breach).subscribe((breach) => {
      this.breach = breach;
    });
  }

  public onProcessngUpdated(breach: BreachModel) {
    this.breach = breach;
    this.ref.detectChanges();
  }
}
