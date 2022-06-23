import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SsoService} from '../services/sso.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-sso',
  templateUrl: './sso.component.html',
  styleUrls: ['./sso.component.scss']
})
export class SsoComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private ssoService: SsoService
  ) { }

  ngOnInit() {
    this.route.queryParams
      .filter(params => params.code)
      .subscribe(params => {
          this.ssoService.fetchJwtToken(params.code)
        }
      );
  }

}
