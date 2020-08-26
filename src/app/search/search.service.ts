import 'rxjs/add/operator/map'
import {Observable} from "rxjs/Observable";
import { SearchApi } from "@api/services";
import {Injectable} from "@angular/core";
import {SearchModel, SearchResultModel} from "@api/models";

@Injectable()
export class SearchService {
  protected q: string;

  constructor(private searchApi: SearchApi) {}

  /**
   * Search method.
   * @param model
   */
  search(model: SearchModel): Observable<SearchResultModel[]> {
    return this.searchApi.search(model);
  }

}

