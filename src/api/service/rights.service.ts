import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { BaseService } from '@api/service/base.service';
import { Rights } from '@api/model/rights.model';
import { Template } from '@api/model/template.model';

@Injectable()
export class RightsService extends BaseService<Rights> {

  protected modelClass = Rights;

  protected routing: any = {
    all: '/rightss',
    one: '/rightss/{id}',
    export: '/rightss/{id}/export',
    import: '/rightss/import',
    template: '/rightss/new-from-template/{templateId}',
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(criteria?: string): Observable<Rights[]> {
    return this.httpGetAll(this.routing.all, null, criteria);
  }

  public get(id: any): Observable<Rights> {
    return this.httpGetOne(this.routing.one, { id: id });
  }

  public update(model: Rights): Observable<Rights> {
    return this.httpPut(this.routing.one, { id: model.id }, model);
  }

  public create(model: Rights): Observable<Rights> {
    return this.httpPost(this.routing.all, {}, model);
  }

  public deleteById(id: any): Observable<Rights> {
    return this.httpDelete(this.routing.one, { id: id });
  }

  public delete(model: Rights): Observable<Rights> {
    return this.deleteById(model.id);
  }

  public export(id: number): Observable<string> {
    const query: any = this.buildQuery({});
    const route = this.buildRoute(this.routing.export, {id: id});

    return this.http.get(route, { params: query }).pipe(map((res: any) => {
      return res
    }));
  }

  public import(data: any): Observable<Rights> {
    const query: any = this.buildQuery({});
    const route = this.buildRoute(this.routing.import, {name: name});

    return this.http.post(route, {data: data}, { params: query }).pipe(map(res => this.mapToModel(res, this.modelClass)));
  }


  public createFromTemplate(model: Rights, template: Template): Observable<Rights> {
    return this.httpPost(this.routing.template, { templateId: template.id }, model);
  }
}
