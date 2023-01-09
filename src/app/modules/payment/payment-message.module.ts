import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentMessageRoutingModule } from './payment-message-routing.module';
import { PaymentMessageComponent } from './layout/payment-message.component';

@NgModule({
  imports: [
    CommonModule,
    PaymentMessageRoutingModule
  ],
  declarations: [PaymentMessageComponent]
})
export class PaymentMessageModule { }
