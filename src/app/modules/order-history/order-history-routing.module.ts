import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderHistoryLayoutComponent } from './layout/order-history-layout.component';

const routes: Routes = [
  {
    path: '',
    component: OrderHistoryLayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderHistoryRoutingModule { }
