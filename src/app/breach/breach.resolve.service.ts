import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot} from '@angular/router';
import { BreachModel } from '@api/models';
import { BreachApi } from '@api/services';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class BreachResolve implements Resolve<any> {
  constructor(private breachApi: BreachApi) { }

  resolve(route: ActivatedRouteSnapshot) {//: Observable<BreachModel> {
    const breachId = route.params.id;
return new BreachModel();
    //return this.breachApi.get(breachId);
  }
}
