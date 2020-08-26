import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {SearchModel, SearchResultModel} from "@api/models";
import {SearchService} from "./search.service";
import {AuthenticationService} from "@security/authentication.service";
import {UserProfile} from "@api/model";
import {UserProfileStructure} from "@api/model/user-profile.model";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  searchResults: SearchResultModel[];
  structures: UserProfileStructure[];
  isSearched: Boolean = false;

  constructor(private _searchService: SearchService, private _authService: AuthenticationService) {}

  ngOnInit() {
    this.searchForm = new FormGroup({
      q: new FormControl()
    });
    this._authService.profileSubject.subscribe((profile: UserProfile) =>{
      this.structures = profile.portfolio_structures;
    });
  }

  onSubmit() {
    this.isSearched = false;
    const search = new SearchModel();
    search.value = this.searchForm.value.q ? this.searchForm.value.q : "";

    this._searchService.search(search).subscribe((searchResultModels: SearchResultModel[]) => {
      this.searchForm.reset();
      this.searchResults = searchResultModels;
      this.isSearched = true;
    });
  }
}
