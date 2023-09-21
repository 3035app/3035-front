import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BaseService} from '@api/service/base.service';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {UserToken} from '@api/model';

@Injectable()
export class SsoService extends BaseService<any> {

  constructor(http: HttpClient) {
    super(http);
  }

  public fetchJwtToken(code: String, redirectUri: String) {
    return this.http
      .get(`${environment.api.host}/authBySso/${code}?redirect_uri=${redirectUri}`)
      .pipe(map(res => this.mapToModel(res, UserToken)));
  }
}
