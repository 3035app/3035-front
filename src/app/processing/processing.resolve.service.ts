import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot} from '@angular/router';
import { ProcessingModel } from '@api/models';
import { ProcessingApi } from '@api/services';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Injectable()
export class ProcessingResolve implements Resolve<any> {
  constructor(private processingApi: ProcessingApi) { }

  resolve(route: ActivatedRouteSnapshot): Observable<ProcessingModel> {
    const processingId = route.params.id;

    return this.processingApi.get(processingId).map(res => {
      res.informed_concerned_people = res.informed_concerned_people ? res.informed_concerned_people : {
        mention_form: false,
        mention_contract: false,
        terms: false,
        display: false,
        phone: false,
        other: false
      };
      res.consent_concerned_people = res.consent_concerned_people ? res.consent_concerned_people : {
        optin_website: false,
        optin_user_space: false,
        phone: false,
        paper: false,
        signing_paper_form: false,
        signing_contract: false,
        signing_standard_form: false,
        other: false
      };
      res.access_concerned_people = res.access_concerned_people ? res.access_concerned_people : {
        contact_dpo: false,
        contact_referent: false,
        customer_area_form: false,
        paper_form: false,
        other: false
      };
      res.delete_concerned_people = res.delete_concerned_people ? res.delete_concerned_people : {
        contact_dpo: false,
        contact_referent: false,
        customer_area_form: false,
        paper_form: false,
        other: false
      };
      res.limit_concerned_people = res.limit_concerned_people ? res.limit_concerned_people : {
        contact_dpo: false,
        contact_referent: false,
        customer_area_form: false,
        paper_form: false,
        other: false
      };
      res.subcontractors_obligations = res.subcontractors_obligations ? res.subcontractors_obligations : {
        yes: false,
        no: false,
        partially: false
      };
      return res;
    });
  }
}
