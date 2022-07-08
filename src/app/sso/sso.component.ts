import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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
    private router: Router,
    private ssoService: SsoService
  ) { }

  ngOnInit() {
    this.route.queryParams
      .filter(params => params.code)
      .subscribe(params => {
          this.ssoService.fetchJwtToken(params.code, 'http://localhost:4200/callback/').subscribe((token) => {
            localStorage.setItem('token', token)
            this.router.navigate(['/'])
          })
        }
      );
  }

}
