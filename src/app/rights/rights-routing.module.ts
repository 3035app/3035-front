import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RightsComponent } from 'app/rights/rights.component';
import { AuthenticationGuardService } from '@security/authentication-guard.service';
import { RightsResolve } from 'app/rights/rights.resolve.service';

const routes: Routes = [
  {
    path: 'rights/:id',
    component: RightsComponent,
    canActivate: [AuthenticationGuardService],
    resolve: {
      rights: RightsResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [RightsResolve]
})
export class RightsRoutingModule { }
