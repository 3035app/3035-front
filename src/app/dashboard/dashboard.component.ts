import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileSession } from 'app/services/profile-session.service';
import { AuthenticationService } from '@security/authentication.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: []
})
export class DashboardComponent implements OnInit {
  public items = [];
  public higherRole = {};

  constructor(
    private session: ProfileSession,
    private router: Router,
    private authService: AuthenticationService,
  ) {}
  
  
  ngOnInit(): void {
    if (this.session.hasPortfolioStructures()) {
      this.items.push({title: 'dashboard.items.portfolio', icon: 'fa-briefcase', name: 'portfolio', action: () => {
        this.router.navigate(['/portfolio']);
      } });
    }
    if (this.session.hasOwnStructure()) {
      this.items.push({ title: environment.tenant === "sncf" ? 'dashboard.items.processings_sncf' : 'dashboard.items.processings', icon: 'fa-file-text', name: 'processings', action: () => {
        this.session.navigateToOwnStructure();
      } });
    }
    this.higherRole = this.authService.getOwnHigherRole();
  }
}
