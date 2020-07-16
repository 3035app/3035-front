import { Component, Input } from '@angular/core';
import { ModalsService } from '../../../modals/modals.service';
import { ProcessingModel, ProcessingAttachmentModel } from '@api/models';
import { AttachmentsService } from 'app/processing/attachments/attachments.service';

@Component({
  selector: 'app-processing-attachment-item',
  templateUrl: './attachment-item.component.html',
  styleUrls: ['./attachment-item.component.scss']
})
export class AttachmentItemComponent {

  @Input() attachment: ProcessingAttachmentModel;
  @Input() processing: ProcessingModel;

  constructor(private _modalsService: ModalsService, public _attachmentsService: AttachmentsService) { }

  /**
   * Deletes an attachment with a given id.
   * @param {string} id - Unique id of the attachment to be deleted.
   * @memberof AttachmentItemComponent
   */
  removeAttachment(id: string) {
    localStorage.setItem('attachment-id', id);
    this._modalsService.openModal('modal-remove-processing-attachment');
  }
}
