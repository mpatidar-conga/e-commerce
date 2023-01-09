import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManageCartComponent } from './layout/manage-cart.component';

const routes: Routes = [
  {
    path: 'active',
    component: ManageCartComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageCartRoutingModule { }
