import { Injectable } from '@angular/core';

@Injectable()
export class HistoryService {

  constructor() { }

  /**
   * Format history received from the processing to a new object for easy display
   * @param {Array} trackings
   * @memberof HistoryService
   */
  getFormatedHistory(trackings: Array<any>) {
    const history = {
      createdBy: '',
      createdOn: '',
      updatedBy: '',
      updatedOn: '',
      evaluationRequestedBy: '',
      evaluationRequestedOn: '',
      evaluatedBy: '',
      evaluatedOn: '',
      issueRequestedBy: '',
      issueRequestedOn: '',
      noticedBy: '',
      noticedOn: '',
      validationRequestedBy: '',
      validationRequestedOn: '',
      validatedBy: '',
      validatedOn: '',
      rejectedBy: '',
      rejectedOn: ''
    };

    if (trackings) {
      trackings.forEach((action) => {
        switch (action.activity) {
          case 'created':
            history.createdBy = action.owner;
            const createDate = new Date(action.date)
            history.createdOn = createDate.toLocaleDateString();
            break;
          case 'last-update':
            history.updatedBy = action.owner;
            const updateDate = new Date(action.date)
            history.updatedOn = updateDate.toLocaleDateString();
            break;
          case 'evaluation-request':
            history.evaluationRequestedBy = action.owner;
            const evaluationRequestDate = new Date(action.date)
            history.evaluationRequestedOn = evaluationRequestDate.toLocaleDateString();
            break;
          case 'evaluation':
            history.evaluatedBy = action.owner;
            const evaluationDate = new Date(action.date)
            history.evaluatedOn = evaluationDate.toLocaleDateString();
            break;
          case 'issue-request':
            history.issueRequestedBy = action.owner;
            const issueRequestDate = new Date(action.date)
            history.issueRequestedOn = issueRequestDate.toLocaleDateString();
            break;
          case 'notice-issued':
            history.noticedBy = action.owner;
            const noticeDate = new Date(action.date)
            history.noticedOn = noticeDate.toLocaleDateString();
            break;
          case 'validation-request':
            history.validationRequestedBy = action.owner;
            const validationRequestDate = new Date(action.date)
            history.validationRequestedOn = validationRequestDate.toLocaleDateString();
            break;
          case 'validated':
            history.validatedBy = "Validé par " + action.owner;
            const validateDate = new Date(action.date)
            history.validatedOn = "le " + validateDate.toLocaleDateString();
            break;
          case 'rejected':
            history.rejectedBy = "Refusé par " + action.owner;
            const rejectDate = new Date(action.date)
            history.rejectedOn = "le " + rejectDate.toLocaleDateString();
            break;
        }
      });
    }
    return history;
  }
}
