
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model';

@Injectable()
export class UserService extends BaseService<User> {

  protected modelClass = User;

  protected routing: any = {
    all: '/structures/{structureId}/users'
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(structureId: string): Observable<User[]> {
    return this.httpGetAll(this.routing.all, {structureId: structureId});
  }
}
