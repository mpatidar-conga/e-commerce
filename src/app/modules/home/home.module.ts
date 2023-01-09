import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './layout/home.component';
import { ComponentModule } from '../../components/component.module';

import { ProductCarouselModule, JumbotronModule, IconModule, AlertModule } from '@congacommerce/elements';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    ComponentModule,
    JumbotronModule,
    ProductCarouselModule,
    IconModule,
    AlertModule
  ],
  declarations: [HomeComponent]
})
export class HomeModule { }
