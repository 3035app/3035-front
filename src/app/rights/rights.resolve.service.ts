import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot} from '@angular/router';
import { RightsModel } from '@api/models';
import { RightsApi } from '@api/services';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class RightsResolve implements Resolve<any> {
  constructor(private rightsApi: RightsApi) { }

  resolve(route: ActivatedRouteSnapshot) {//: Observable<RightsModel> {
    const rightsId = route.params.id;
return new RightsModel();
    //return this.rightsApi.get(rightsId);
  }
}
