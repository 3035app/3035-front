import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs/Observable';

import {SearchModel, SearchResultModel} from "@api/models";
import {map} from "rxjs/operators";

@Injectable()
export class SearchService extends BaseService<SearchResultModel> {

  protected modelClass = SearchResultModel;

  protected routing: any = {
    search: '/search',
  };

  constructor(http: HttpClient) {
    super(http);
  }

  public search(model: SearchModel): Observable<SearchResultModel[]> {
    const query: any = this.buildQuery({});
    const route = this.buildRoute(this.routing.search);

    return this.http.post(
      route,
      model,
      { params: query }
    )
      .pipe(map(res => this.mapToCollection(res, this.modelClass)));
  }
}
