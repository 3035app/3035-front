import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SsoService} from '../services/sso.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

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
            .subscribe((token) => {
              localStorage.setItem('token', JSON.stringify(token))
              this.router.navigate(['/'])
            })
        }
      );
  }

}
