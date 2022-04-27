
import { BaseModel } from '@api/model/base.model';
import { FolderModel, ProcessingCommentModel, ProcessingAttachmentModel } from '@api/models';

export class Processing extends BaseModel {
  public id: any;
  public name: string;
  public status: number;
  public description: string;
  // A supprimer
  public author: string;
  public redactor: any;
  public redactors_id: number;
  public life_cycle: string;
  public storage: string;
  public standards: string;
  public processors: string;
  // A supprimer
  public designated_controller: string;
  public data_controller_id: number;
  public controllers: string;
  public non_eu_transfer: string;
  public processing_data_types: any;
  public folder: FolderModel;
  public pias_count: number;
  public recipients: string;
  public context_of_implementation: string;
  public lawfulness: string;
  public consent: string;
  public rights_guarantee: string;
  public exactness: string;
  public minimization: string;
  public evaluation_comment: string;
  public evaluation_state: number;
  public concerned_people: string;
  public comments: ProcessingCommentModel[] = [];
  public attachments: ProcessingAttachmentModel[] = [];
  public informed_concerned_people: object = {
    mention_form: false,
    mention_contract: false,
    terms: false,
    display: false,
    phone: false,
    other: false
  };
  public consent_concerned_people: object = {
    optin_website: false,
    optin_user_space: false,
    phone: false,
    paper: false,
    signing_paper_form: false,
    signing_contract: false,
    signing_standard_form: false,
    other: false
  };
  public access_concerned_people: object = {
    contact_dpo: false,
    contact_referent: false,
    customer_area_form: false,
    paper_form: false,
    other: false
  };
  public delete_concerned_people: object = {
    contact_dpo: false,
    contact_referent: false,
    customer_area_form: false,
    paper_form: false,
    other: false
  };
  public limit_concerned_people: object = {
    contact_dpo: false,
    contact_referent: false,
    customer_area_form: false,
    paper_form: false,
    other: false
  };
  public subcontractors_obligations: object = {
    yes: false,
    no: false,
    partially: false
  };
  public can_show: boolean;
  public evaluator_pending_id: number;
  public data_protection_officer_pending_id: number;
  public evaluator_pending: any;
  public data_protection_officer_pending: any;
  public supervisors: any;
}

export enum ProcessingStatus {
  STATUS_DOING = 0,
  STATUS_UNDER_VALIDATION = 1,
  STATUS_VALIDATED = 2,
  STATUS_ARCHIVED = 3
}

export enum ProcessingEvaluationStates {
  EVALUATION_STATE_NONE = -1,
  EVALUATION_STATE_TO_CORRECT = 0,
  EVALUATION_STATE_IMPROVABLE = 1,
  EVALUATION_STATE_ACCEPTABLE = 2
}
