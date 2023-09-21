import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SsoService} from '../services/sso.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {UserTokenModel} from '@api/models';
import {UserToken} from '@api/model';

@Component({
  selector: 'app-sso',
  templateUrl: './sso.component.html',
  styleUrls: ['./sso.component.scss']
})
export class SsoComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ssoService: SsoService
  ) { }

  ngOnInit() {
    this.route.queryParams
      .filter(params => params.code)
      .subscribe(params => {
          this.ssoService.fetchJwtToken(params.code, environment.sncf.callback_url)
            .subscribe((token: UserToken) => {
              UserTokenModel.setLocalToken(token)
              this.router.navigate(['/'])
            })
        }
      );
  }

}
