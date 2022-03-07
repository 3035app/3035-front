
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model';

@Injectable()
export class UserService extends BaseService<User> {

  protected modelClass = User;

  protected routing: any = {
    all: '/structures/{structureId}/users',
    folderUsers: '/folders/{folderId}/users'
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(structureId: any): Observable<User[]> {
    return this.httpGetAll(this.routing.all, {structureId: structureId});
  }

  public getFolderUsers(folderId: any): Observable<User[]> {
    return this.httpGetAll(this.routing.folderUsers, {folderId: folderId })
  }
}
