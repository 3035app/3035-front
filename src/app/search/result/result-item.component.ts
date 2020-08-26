import { Component, OnInit, Input} from '@angular/core';
import {SearchResult, Structure} from "@api/model";
import {ProfileSession} from "../../services/profile-session.service";
import {UserProfileStructure} from "@api/model/user-profile.model";

@Component({
  selector: '[app-search-result-item]',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.scss']
})
export class ResultItemComponent implements OnInit {
  @Input() searchResult: SearchResult
  @Input() structures: UserProfileStructure[]

  constructor(private session:ProfileSession) {}

  ngOnInit() {}

  getRouteByType() {
    switch (this.searchResult.type) {
      case "processing":
        return "/processing/";
      case "folder":
        return "/folders/";
      default:
        console.error("Not corresponding type for routing: " + this.searchResult.type)
        return;
    }
  }

  navigateToStructure() {
    if (this.searchResult.type === "structure") {
      const structure = this.structures.find(el => {
        return el.id === this.searchResult.id;
      })
      this.session.navigateToStructure(structure)
    } else {
      console.error("Unauthorized type: " + this.searchResult.type)
    }
  }
}
