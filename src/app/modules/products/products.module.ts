import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ComponentModule } from '../../components/component.module';
import { ProductsRoutingModule } from './products.routing.module';
import { ProductDetailComponent } from './detail/product-detail.component';

import { PricingModule} from '@congacommerce/ecommerce';
import { ApttusModule } from '@congacommerce/core';

import { TabFeaturesComponent } from './component/tab-features.component';
import { TabAttachmentsComponent } from './component/tab-attachments.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ProductReplacementsComponent } from './component/product-replacements.component';
import { ResultsComponent } from './component/results.component';

import { PaginationModule } from 'ngx-bootstrap/pagination';

import { ConfigureGuard } from '../../services/configure.guard';
import {
  BreadcrumbModule,
  ButtonModule,
  PriceModule,
  ProductCarouselModule,
  ProductConfigurationModule,
  IconModule,
  InputDateModule,
  ProductImagesModule,
  ConfigurationSummaryModule,
  ProductCardModule,
  FilterModule,
  InputFieldModule,
  InputSelectModule,
  ConstraintRuleModule,
  AlertModule,
  SelectAllModule
} from '@congacommerce/elements';
import { TranslateModule } from '@ngx-translate/core';
import { DetailsModule } from '../details/details.module';
import { ProductListComponent } from './list/product-list.component';

@NgModule({
  imports: [
    CommonModule,
    BreadcrumbModule,
    ProductCarouselModule,
    ProductConfigurationModule,
    ConfigurationSummaryModule,
    IconModule,
    ButtonModule,
    ProductImagesModule,
    PriceModule,
    FormsModule,
    ProductsRoutingModule,
    ComponentModule,
    PricingModule,
    ApttusModule,
    TabsModule.forRoot(),
    InputDateModule,
    TranslateModule.forChild(),
    DetailsModule,
    PaginationModule.forRoot(),
    ProductCardModule,
    InputSelectModule,
    InputFieldModule,
    FilterModule,
    ConstraintRuleModule,
    AlertModule,
    SelectAllModule
  ],
  providers : [ConfigureGuard],
  declarations: [ProductDetailComponent,
                TabFeaturesComponent,
                ProductReplacementsComponent,
                TabAttachmentsComponent,
                ProductListComponent,
                ResultsComponent]
})
export class ProductsModule { }
