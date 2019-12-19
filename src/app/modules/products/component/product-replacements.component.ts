import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Product } from '@apttus/ecommerce';
import { ConfigurationService } from '@apttus/core';
/**
 * @ignore
 */
@Component({
  selector: 'apt-product-replacements',
  template: `
    <ul class="list-group list-group-flush">
      <li class="media list-group-item d-flex" *ngFor="let product of productList">
        <img class="mr-3" [src]="product?.IconId | image" alt="Generic placeholder image"  height="60" width="75">
        <div class="media-body">
          <div class="d-flex justify-content-between">
            <h6 class="font-weight-bold mb-0">{{product.Name}}</h6>
            <apt-price [record]="product"></apt-price>
          </div>
          <small class="d-block">{{product.ProductCode}}</small>
          <button class="btn btn-link btn btn-link p-0 mx-0 mt-2" [routerLink]="['/products', product[identifier]]">
            <span class="oi oi-chevron-right"></span>Go To Product
          </button>
        </div>
      </li>
    </ul>
  `,
  styles: [`
    button .oi{
      font-size: smaller;
      margin-right: 5px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * @ignore
 */
export class ProductReplacementsComponent implements OnInit {
  @Input() productList: Array<Product>;
  identifier: string = 'Id';

  constructor(private config: ConfigurationService) { 
    this.identifier = this.config.get('productIdentifier');
  }

  ngOnInit() {

  }
}