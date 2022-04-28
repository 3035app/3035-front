import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ProcessingDataTypeModel } from '@api/models';
import { ProcessingDataTypeApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';

@Component({
  selector: 'app-processing-subcontractors-obligations',
  templateUrl: './processing-subcontractors-obligations.component.html',
  styleUrls: ['./processing-subcontractors-obligations.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProcessingSubcontractorsObligationsComponent),
      multi: true
    }
  ]
})

export class ProcessingSubcontractorsObligationsComponent implements ControlValueAccessor {
  public subcontractors_obligations_yes: Field = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  public subcontractors_obligations_no: Field = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  public subcontractors_obligations_partially: Field = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  @Input() processingId: number;
  @Input() processingStatus: number;
  hasEditPermission: boolean = false;


  constructor(
    private processingDataTypeApi: ProcessingDataTypeApi,
    private permissionsService: PermissionsService,
  ) {
    this.permissionsService.hasPermission('CanEditProcessing').then((hasPerm: boolean) => {
      if (hasPerm) {
        this.hasEditPermission = true;
      }
    });
  }

  /**
   * Update model value from form control value
   *
   * @param reference
   * @param field
   * @param value
   */
  updateValue(reference: string, enable: boolean = false): void {
    const type = this[reference].processingDataType;
    // Create new
    if (!type.id) {
      // Set missing properties
      type.processing_id = this.processingId;
      type.reference = reference;
      // Create on server
      this.processingDataTypeApi.create(type).subscribe((theType: ProcessingDataTypeModel) => {
        // Udate model
        this[reference].processingDataType = theType;
      });

      return;
    }

    // Disable existing
    if (enable) {
      // Delete from server
      this.processingDataTypeApi.delete(type).subscribe(() => {
        // Clear model
        this[reference].processingDataType = new ProcessingDataTypeModel();
      });
    }

    // Update existing on server
    this.processingDataTypeApi.get(type.id).subscribe(pdt => {
      const thePdt = Object.assign(pdt, type); // Fix missing .toJson method because « type » var is not of type ProcessingDataTypeModel
      this.processingDataTypeApi.update(thePdt).subscribe((theType: ProcessingDataTypeModel) => {
        // update model
        this[reference].processingDataType = theType;
      });
    });
  }

  /**
   * Write form control value
   *
   * @param element
   */
  writeValue(value: any): void {
    if (value) {
      value.forEach((type: ProcessingDataTypeModel) => {
        if (this[type.reference]) { 
          this[type.reference].enabled = true;
          this[type.reference].processingDataType = type;
        }
      });
    }
  }

  /**
   * Register onChange callback
   *
   * @param fn
   */
  registerOnChange(fn: any): void {
  }

  /**
   * Register onTouched callback
   *
   * @param fn
  */
  registerOnTouched(fn: any): void {
  }

  /**
   * Set disabled state of form control
   *
   * @param isDisabled
   */
  setDisabledState?(isDisabled: boolean): void {
  }
}

interface Field {
  enabled: boolean;
  processingDataType: ProcessingDataTypeModel
}
