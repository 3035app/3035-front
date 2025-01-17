import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthenticationComponent } from 'app/authentication/authentication.component';
import { SummaryComponent } from 'app/summary/summary.component';
import { HelpComponent } from 'app/help/help.component';
import { AboutComponent } from 'app/about/about.component';
import { ErrorsComponent } from 'app/errors/errors.component';
import { SearchComponent } from 'app/search/search.component';

import { CardsRoutingModule } from 'app/cards/cards-routing.module';
import { EntryRoutingModule } from 'app/entry/entry-routing.module';
import { ProcessingRoutingModule } from 'app/processing/processing-routing.module';
import { TemplatesRoutingModule } from 'app/templates/templates-routing.module';
import { PortfolioRoutingModule } from 'app/portfolio';
import { DashboardRoutingModule } from 'app/dashboard';
import { AuthenticationGuardService } from '@security/authentication-guard.service';

import { PiaResolve } from 'app/services/pia.resolve.service';
import { PiaService } from 'app/entry/pia.service';
import { PiasListComponent } from './pias/list/list.component';
import { ProcessingResolve } from './processing/processing.resolve.service';
import { StructureResolve } from './structure/structure.resolve.service';
import { StructureComponent } from 'app/structure/structure.component';
import { ReportingComponent } from 'app/reporting/reporting.component';


const routes: Routes = [
  {
    path: 'home',
    redirectTo: 'dashboard'
  },
  { path: '', component: AuthenticationComponent },
  { path: 'logout', component: AuthenticationComponent },
  {
    path: 'summary/:id',
    component: SummaryComponent ,
    canActivate: [AuthenticationGuardService, PiaResolve]
  },
  { path: 'help', component: HelpComponent },
  { path: 'about', component: AboutComponent },
  { path: 'search', component: SearchComponent },
  {
    path: 'structure/:id',
    component: StructureComponent,
    canActivate: [AuthenticationGuardService],
    resolve: {structure: StructureResolve}
  },
  {
    path: 'reporting/:id',
    component: ReportingComponent,
    canActivate: [AuthenticationGuardService],
    resolve: {structure: StructureResolve}
  },
  {
    path: 'processing/:id/pias',
    component: PiasListComponent,
    canActivate: [AuthenticationGuardService],
    resolve: {processing: ProcessingResolve}
  },
  { path: '**', component: ErrorsComponent },
];

@NgModule({
  imports: [
    CardsRoutingModule,
    EntryRoutingModule,
    TemplatesRoutingModule,
    PortfolioRoutingModule,
    DashboardRoutingModule,
    ProcessingRoutingModule,
    RouterModule.forRoot(routes, { useHash: true }),
  ],
  exports: [RouterModule],
  providers: [
    PiaService,
    PiaResolve,
    ProcessingResolve,
    StructureResolve
  ]
})

export class AppRoutingModule { }
