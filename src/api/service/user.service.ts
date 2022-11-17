
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
    folderUsers: '/folders/{folderId}/users',
    processingUsers: '/processings/{processingId}/users'
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(structureId: any): Observable<User[]> {
    # workaround on red popup 404 (OP #1924)
    if ( isNaN(structureId) ) {
      structureId = 0;
    }
    return this.httpGetAll(this.routing.all, {structureId: structureId});
  }

  public getFolderUsers(folderId: any): Observable<User[]> {
    return this.httpGetAll(this.routing.folderUsers, {folderId: folderId })
  }

  public getProcessingUsers(processingId: any): Observable<User[]> {
    return this.httpGetAll(this.routing.processingUsers, { processingId })
  }
}
