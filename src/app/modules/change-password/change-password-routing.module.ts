import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChangePasswordLayoutComponent } from './layout/change-password-layout.component';

const routes: Routes = [{
  path: '',
  component: ChangePasswordLayoutComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChangePasswordRoutingModule { }
