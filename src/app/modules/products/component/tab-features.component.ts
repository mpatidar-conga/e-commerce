import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Product } from '@congacommerce/ecommerce';

@Component({
  selector: 'pdp-tab-features',
  template: `
    <table class="table table-sm">
      <thead>
        <tr>
          <th scope="col" class="border-top-0">#</th>
          <th scope="col" class="border-top-0">{{'PRODUCT_DETAILS.FEATURE' | translate}}</th>
          <th scope="col" class="border-top-0">{{'PRODUCT_DETAILS.VALUE' | translate}}</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let feature of product?.ProductFeatureValues; let i = index">
          <th scope="row">{{i + 1}}</th>
          <td>{{feature.Feature.Name}}</td>
          <td>{{feature.Value}}</td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    :host{
      font-size: smaller;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TabFeaturesComponent {
  @Input() product: Product;

  constructor() { }

}
