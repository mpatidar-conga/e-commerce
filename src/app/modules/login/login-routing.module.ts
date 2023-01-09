import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginLayoutComponent } from './layout/login-layout.component';

const routes: Routes = [
  {
    path: ':orderId',
    component: LoginLayoutComponent
  },
  {
    path: '',
    component: LoginLayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
