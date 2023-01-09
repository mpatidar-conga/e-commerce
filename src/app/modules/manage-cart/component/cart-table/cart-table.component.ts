import { Component, OnChanges, Input } from '@angular/core';
import { Cart, CartItem } from '@congacommerce/ecommerce';
import * as _ from 'lodash';
@Component({
  selector: 'app-cart-table',
  templateUrl: './cart-table.component.html',
  styleUrls: ['./cart-table.component.scss']
})
export class CartTableComponent implements OnChanges {
  @Input() cart: Cart;
  tableItems: Array<TableCartItem> = [];
  ngOnChanges() {
    this.tableItems = [];
    if (this.cart && _.get(this.cart.LineItems, 'length') > 0) {
      _.get(this.cart, 'LineItems').filter(cartItem => {
        return cartItem.IsPrimaryLine && cartItem.LineType === 'Product/Service';
      })
        .forEach(lineItem => {
          this.tableItems.push({
            parent: lineItem,
            children: this.cart.LineItems.filter(cartItem => !cartItem.IsPrimaryLine && cartItem.PrimaryLineNumber === lineItem.PrimaryLineNumber)
          });
        });
    }
  }

  trackById(index, record: CartItem): string {
    return _.get(record, 'Id');
  }
}
interface TableCartItem {
  parent: CartItem;
  children: Array<CartItem>;
}
