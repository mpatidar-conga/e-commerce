import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Cart, CartItem, CartService, Product, ConstraintRuleService, CartItemService, ItemGroup, LineItemService, OrderLineItem, QuoteLineItem } from '@congacommerce/ecommerce';
import { Observable, combineLatest } from 'rxjs';
import { map as rmap } from 'rxjs/operators';
import { get, filter } from 'lodash';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-cart',
  templateUrl: './manage-cart.component.html',
  styleUrls: ['./manage-cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ManageCartComponent implements OnInit {

  @ViewChild('discardChangesTemplate') discardChangesTemplate: TemplateRef<any>;

  /**
   * Observable of the information for rendering this view.
   */
  view$: Observable<ManageCartState>;
  primaryLI: Array<CartItem> = [];

  constructor(private cartService: CartService, 
              private cartItemService: CartItemService, 
              private crService: ConstraintRuleService,
              private router: Router, 
              private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.view$ = combineLatest(
      this.cartService.getMyCart(),
      this.crService.getRecommendationsForCart())
      .pipe(
        rmap(([cart, products]) => {
          this.primaryLI = filter(get(cart, 'LineItems'), (i) => i.IsPrimaryLine && i.LineType === 'Product/Service');
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
