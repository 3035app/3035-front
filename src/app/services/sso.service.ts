import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BaseService} from '@api/service/base.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class SsoService extends BaseService<any> {

  constructor(http: HttpClient) {
    super(http);
  }

  public fetchJwtToken(code: String, redirectUri: String) {
    return this
      .httpGetOne('/authBySso/{code}?redirect_uri={redirectUri}', {code: code, redirectUri: redirectUri})
    ;
  }
}
