import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { BaseService } from '@api/service/base.service';
import { Breach } from '@api/model/breach.model';
import { Template } from '@api/model/template.model';

@Injectable()
export class BreachService extends BaseService<Breach> {

  protected modelClass = Breach;

  protected routing: any = {
    all: '/breachs',
    one: '/breachs/{id}',
    export: '/breachs/{id}/export',
    import: '/breachs/import',
    template: '/breachs/new-from-template/{templateId}',
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public getAll(criteria?: string): Observable<Breach[]> {
    return this.httpGetAll(this.routing.all, null, criteria);
  }

  public get(id: any) : Observable<Breach> {
    return this.httpGetOne(this.routing.one, { id: id });
  }

  public update(model: Breach): Observable<Breach> {
    return this.httpPut(this.routing.one, { id: model.id }, model);
  }

  public create(model: Breach): Observable<Breach> {
    return this.httpPost(this.routing.all, {}, model);
  }

  public deleteById(id: any): Observable<Breach> {
    return this.httpDelete(this.routing.one, { id: id });
  }

  public delete(model: Breach): Observable<Breach> {
    return this.deleteById(model.id);
  }

  public export(id: number): Observable<string> {
    const query: any = this.buildQuery({});
    const route = this.buildRoute(this.routing.export, {id: id});

    return this.http.get(route, { params: query }).pipe(map((res: any) => {
      return res
    }));
  }

  public import(data: any): Observable<Breach> {
    const query: any = this.buildQuery({});
    const route = this.buildRoute(this.routing.import, {name: name});

    return this.http.post(route, {data: data}, { params: query }).pipe(map(res => this.mapToModel(res, this.modelClass)));
  }


  public createFromTemplate(model: Breach, template: Template): Observable<Breach> {
    return this.httpPost(this.routing.template, { templateId: template.id }, model);
  }
}
