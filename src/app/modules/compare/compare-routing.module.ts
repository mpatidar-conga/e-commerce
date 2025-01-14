import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompareLayoutComponent } from './layout/compare-layout.component';

const routes: Routes = [
  {
    path: '',
    component: CompareLayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompareRoutingModule { }
