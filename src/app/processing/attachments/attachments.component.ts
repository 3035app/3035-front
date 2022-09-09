import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ProcessingModel, ProcessingAttachmentModel } from '@api/models';
import { ProcessingApi, ProcessingAttachmentApi } from '@api/services';
import { AttachmentsService } from './attachments.service';
import { PermissionsService } from '@security/permissions.service';

@Component({
  selector: 'app-processing-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {

  @Input() processing: ProcessingModel;
  processingAttachmentForm: FormGroup;
  hasEditPermission: boolean = false;

  constructor(
    public attachmentsService: AttachmentsService,
    private permissionsService: PermissionsService,
  ) {
    this.permissionsService.hasPermission('CanEditProcessing').then((hasPerm: boolean) => {
      if (hasPerm) {
        this.hasEditPermission = true;
      }
    });
  }

  ngOnInit() {
    this.attachmentsService.processing = this.processing;
    this.attachmentsService.listAttachments();

    this.processingAttachmentForm = new FormGroup({
      attachment_file: new FormControl('', [])
    });
  }

  /**
   * Allows users to add attachments to a Processing.
   * @memberof AttachmentsComponent
   */
  addAttachment() {
    const attachment = <HTMLInputElement>document.querySelector('[formcontrolname="attachment_file"]');
    attachment.click();
  }
}
