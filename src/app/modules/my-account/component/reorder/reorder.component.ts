import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product, OrderService, Order, CartService, CartProductForm, Cart, CartItem } from '@congacommerce/ecommerce';
import * as _ from 'lodash';
import { Observable, combineLatest } from 'rxjs';
import { ACondition } from '@congacommerce/core';
import { flatMap, take } from 'rxjs/operators';
@Component({
  selector: 'app-reorder',
  templateUrl: './reorder.component.html',
  styleUrls: ['./reorder.component.scss']
})
export class ReorderComponent implements OnInit {
  cart: Cart;
  order: Order;
  subList = [];
  cartLoading: boolean = false;


  constructor(private productService: ProductService, private orderService: OrderService, private route: ActivatedRoute, private cartService: CartService) {
    this.productService.customFields = ['Digital_Product_Family__c'];
  }

  ngOnInit() {
    this.subList.push(this.route.params
      .pipe(
        flatMap(r => this.orderService.getOrderByName(r.orderId)),
        take(1)
      )
      .subscribe(order => {
        this.order = order;
        this.onOrder();
      }));
  }

  onOrder(){
      combineLatest(this.productService.where([new ACondition(Product, 'Id', 'NotNull', null)]), this.cartService.createNewCart(new Cart(), false))
      .subscribe(([productList, cart]) =>{
        this.cart = cart;
        cart.LineItems = new Array<CartItem>();
        productList.forEach(product => {
          const lineItem = _.get(this.order, 'OrderLineItems', []).filter(x => x.ProductId === product.Id)[0];
          // const cartItem = this.cartService.getCartItem(product, (lineItem) ? lineItem.Quantity : 0, cart, false);
          // cartItem['Digital_Product_Family_LI__c'] = product['Digital_Product_Family__c'];
          // cart.LineItems.push(cartItem);
        });
      });
    }

  onQuantityChange(evt){
    console.log(evt);
  }

}

/** @ignore */
export interface ProductQuantityMap{
  quantity: number;
  product: Product;
}
