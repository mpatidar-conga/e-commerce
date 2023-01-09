import { Component, Output, EventEmitter } from '@angular/core';
import { AFilter, ACondition } from '@congacommerce/core';
import { AssetLineItem } from '@congacommerce/ecommerce';

@Component({
  selector: 'app-price-type-filter',
  template: `
    <div class="card animated fadeIn">
      <div class="card-body">
        <h5 class="card-title">{{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.PRICE_TYPE' | translate}} </h5>
        <ul class="list-unstyled pl-2">
          <li>
            <div class="custom-control custom-radio">
              <input
                type="radio"
                  id="priceTypeAll"
                  class="custom-control-input"
                  name="priceType"
                  value=""
                  (change)="handleCheckChange($event)"
                  checked
                >
              <label class="custom-control-label" for="priceTypeAll">
              {{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.ALL' | translate}}
              </label>
            </div>
          </li>
          <li>
            <div class="custom-control custom-radio">
              <input
                type="radio"
                id="oneTime"
                class="custom-control-input"
                name="priceType"
                value="One Time"
                (change)="handleCheckChange($event)"
              >
              <label class="custom-control-label" for="oneTime">
              {{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.ONE_TIME' | translate}}
              </label>
            </div>
          </li>
          <li>
            <div class="custom-control custom-radio">
              <input
                type="radio"
                id="recurring"
                class="custom-control-input"
                name="priceType"
                value="Recurring"
                (change)="handleCheckChange($event)"
              >
              <label class="custom-control-label" for="recurring">
              {{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.RECURRING' | translate}}
              </label>
            </div>
          </li>
          <li>
            <div class="custom-control custom-radio">
              <input
                type="radio"
                id="usage"
                class="custom-control-input"
                name="priceType"
                value="Usage"
                (change)="handleCheckChange($event)"
              >
              <label class="custom-control-label" for="usage">
              {{'INSTALLED_PRODUCTS.PRICE_TYPE_FILTER.USAGE' | translate}}
              </label>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    li {
      font-size: smaller;
      line-height: 24px;
    }
  `]
})
export class PriceTypeFilterComponent {

  @Output() value: EventEmitter<AFilter> = new EventEmitter();
  private eventMap = {

    'One Time': new AFilter(AssetLineItem, [new ACondition(AssetLineItem, 'PriceType', 'Equal', 'One Time')]),

    Recurring: new AFilter(AssetLineItem, [new ACondition(AssetLineItem, 'PriceType', 'Equal', 'Recurring')]),

    Usage: new AFilter(AssetLineItem, [new ACondition(AssetLineItem, 'PriceType', 'Equal', 'Usage')])
  };

  handleCheckChange(event: any) {
    this.value.emit(this.eventMap[event.target.value]);
  }
}
