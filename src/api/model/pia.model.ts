
import { BaseModel } from './base.model';
import { Folder } from './folder.model';
import { Processing } from './processing.model';


export class Pia extends BaseModel {
  public id: any;
  public status = 0; // 0: doing, 1: refused, 2: simple_validation, 3: signed_validation, 4: archived
  // A supprimer
  public author_name: string;
  // A supprimer
  public evaluator_name: string;
  // A supprimer
  public validator_name: string;
  public redactors_id: number;
  public evaluator_id: number;
  public data_protection_officer_id: number;
  public dpo_status: number = 0; // 0: NOK, 1: OK
  public dpo_opinion: string;
  public concerned_people_opinion: string;
  public concerned_people_status: number = 0; // 0: NOK, 1: OK
  public concerned_people_searched_opinion: boolean = false; // 0 : false, 1: true
  public concerned_people_searched_content: string;
  public hiss_opinion: string;
  public hiss_processing_implemented_status: number = 0; // 0: NOK, 1: OK
  public requested_hiss_opinion: boolean = false; // 0 : false, 1: true
  public requested_hiss_opinion_text: string;
  public rejection_reason: string;
  public applied_adjustments: string;
  public dpos_names: string;
  public people_names: string;
  public hiss_name: string;
  public progress: number;
  public is_example: boolean = false;
  public folder: Folder;
  public type: string = PiaType.regular;
  public processing: Processing;

  public numberOfQuestions = 18; // TODO Auto compute questions number

  public getStatusLabel(): string {
    return this.status >= 0 ? `pia.statuses.${this.status}` : '';
  }

  public getGaugeLabel(value: any): string {
    return value ? `summary.gauges.${value}` : '';
  }

  public validationIsCompleted(): boolean {
    return [
      PiaStatus.SimpleValidation,
      PiaStatus.SignedValidation,
      PiaStatus.Archived
    ].includes(this.status);
  }
}

export enum PiaStatus {
  Doing = 0,
  Refused = 1,
  SimpleValidation = 2,
  SignedValidation = 3,
  Archived = 4
}

export enum PiaType {
  simplified = 'simplified',
  regular = 'regular',
  advanced = 'advanced'
}
