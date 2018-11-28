import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BreachComponent } from 'app/breach/breach.component';
import { AuthenticationGuardService } from '@security/authentication-guard.service';
import {BreachResolve} from 'app/breach/breach.resolve.service';

const routes: Routes = [
  {
    path: 'breach/:id',
    component: BreachComponent,
    canActivate: [AuthenticationGuardService],
    resolve: {
      breach: BreachResolve
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [BreachResolve]
})
export class BreachRoutingModule { }
