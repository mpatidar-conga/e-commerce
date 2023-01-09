import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ApttusModule } from '@congacommerce/core';
import { PricingModule } from '@congacommerce/ecommerce';
import {
  BreadcrumbModule,
  IconModule,
  InputDateModule,
  PriceModule,
  PromotionModule,
  ConfigurationSummaryModule,
  ConstraintRuleModule,
  InputFieldModule,
  AddressModule
} from '@congacommerce/elements';
import { DetailsLayoutComponent } from './layout/details-layout.component';
import { DetailSectionComponent } from './component/detail-section/detail-section.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    BreadcrumbModule,
    ApttusModule,
    IconModule,
    InputDateModule,
    PriceModule,
    PromotionModule,
    PricingModule,
    TranslateModule.forChild(),
    ConfigurationSummaryModule,
    FormsModule,
    InputFieldModule,
    DatepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AddressModule,
    TooltipModule.forRoot(),
    BsDropdownModule.forRoot(),
    ConstraintRuleModule
  ],
  declarations: [DetailsLayoutComponent, DetailSectionComponent],
  exports: [DetailsLayoutComponent, DetailSectionComponent]
})
export class DetailsModule { }
