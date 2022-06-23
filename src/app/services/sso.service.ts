import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BaseService} from '@api/service/base.service';

@Injectable()
export class SsoService extends BaseService<any> {

  constructor(http: HttpClient) {
    super(http);
  }

  public fetchJwtToken(code: String) {
    this
      .httpGetFirst('/authBySso/{code}', {code: code})
      .subscribe((jwtToken) => {
        console.log(jwtToken)
      })
    ;
  }
}
