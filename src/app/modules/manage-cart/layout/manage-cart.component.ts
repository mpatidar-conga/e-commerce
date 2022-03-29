import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Cart, CartService, Product, ConstraintRuleService, CartItemService, ItemGroup, LineItemService, OrderLineItem, QuoteLineItem } from '@congacommerce/ecommerce';
import { Observable, combineLatest } from 'rxjs';
import { map as rmap } from 'rxjs/operators';
import { get } from 'lodash';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-cart',
  templateUrl: './manage-cart.component.html',
  styleUrls: ['./manage-cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Manage Cart component is used to show the list of cart line item(s)  and summary of the cart.
 */
export class ManageCartComponent implements OnInit {

  @ViewChild('discardChangesTemplate') discardChangesTemplate: TemplateRef<any>;

  /**
   * Observable of the information for rendering this view.
   */
  view$: Observable<ManageCartState>;

  constructor(private cartService: CartService, 
              private cartItemService: CartItemService, 
              private crService: ConstraintRuleService, 
              private cdr: ChangeDetectorRef,
              private router: Router) { }

  ngOnInit() {
    this.view$ = combineLatest(
      this.cartService.getMyCart(),
      this.crService.getRecommendationsForCart())
      .pipe(
        rmap(([cart, products]) => {
          return {
            cart: cart,
            lineItems: LineItemService.groupItems(get(cart, 'LineItems')),
            productList: products
          } as ManageCartState;
        })
      );
  }

  trackById(index, record): string {
    return get(record, 'MainLine.Id');
  }

  createQuote(){
    this.router.navigate(['/proposals/create']);
  }
}

/** @ignore */
export interface ManageCartState {
  cart: Cart;
  lineItems: Array<ItemGroup>;
  productList: Array<Product>;
}
