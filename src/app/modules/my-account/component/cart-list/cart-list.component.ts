import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Observable, of, combineLatest } from 'rxjs';
import { ClassType } from 'class-transformer/ClassTransformer';
import { TranslateService } from '@ngx-translate/core';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import * as _ from 'lodash';

import { AObject, AFilter, ACondition } from '@congacommerce/core';
import { CartService, Cart, PriceService } from '@congacommerce/ecommerce';
import { TableOptions, TableAction, RevalidateCartService } from '@congacommerce/elements';

@Component({
  selector: 'app-cart-list',
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss']
})
export class CartListComponent implements OnInit {
  modalRef: BsModalRef;
  message: string;
  loading: boolean = false;
  cart: Cart;
  view$: Observable<CartListView>;
  cartAggregate$: Observable<any>;
  
  type = Cart;


  constructor(private cartService: CartService, 
              public priceService: PriceService,
              private modalService: BsModalService, 
              private translateService: TranslateService,
              private revalidateCartService: RevalidateCartService) { }

  ngOnInit() {
    this.loadView();
  }
  
  loadView() {
    this.view$ = combineLatest([
      this.cartService.getMyCart(),
      this.getCartAggregate()
    ])
    .pipe(
      map(([currentCart, cartList]) => ({
        tableOptions: {
          columns: [
            {
              prop: 'Name'
            },
            {
              prop: 'CreatedDate'
            },
            {
              prop: 'NumberOfItems'
            },
            {
              prop: 'IsActive',
              label: 'Is Active',
              sortable: false,
              value: (record: Cart) => CartService.getCurrentCartId() === record.Id ? of('Yes') : of('No')
            },
            {
              prop: 'TotalAmount',
              label: 'Total Amount',
              sortable: false,
              value: (record: Cart) => this.getCartTotal(record)
            },
            {
              prop: 'Status'
            }
          ],
          lookups: [],
          actions: [
            {
              enabled: true,
              icon: 'fa-check',
              massAction: false,
              label: 'Set Active',
              theme: 'primary',
              validate: (record: Cart) => this.canActivate(record),
              action: (recordList: Array<Cart>) => this.setCartActive(_.first(recordList)),
              disableReload: true
            } as TableAction,
            {
              enabled: true,
              icon: 'fa-trash',
              massAction: true,
              label: 'Delete',
              theme: 'danger',
              validate: (record: Cart) => this.canDelete(record),
              action: (recordList: Array<Cart>) => this.cartService.deleteCart(recordList).pipe(map(()=> this.getCartAggregate())),
              disableReload: true
            } as TableAction
          ],
          highlightRow: (record: Cart) => of(CartService.getCurrentCartId() === record.Id),
          children: ['SummaryGroups'],
          filters: this.getFilters()
        },
        type: Cart
      }))
    );
  }

  
  private getCartAggregate(): any {
    return this.cartAggregate$ = this.cartService.query({
      aggregate: true,
      skipCache: true,
      filters: this.getFilters()
    }).pipe(map(_.first));
  }

  newCart(template: TemplateRef<any>) {
    this.cart = new Cart();
    this.message = null;
    this.modalRef = this.modalService.show(template);
  }


  createCart() {
    this.loading = true;
    this.cartService.createNewCart(this.cart).pipe(take(1)).subscribe(
      res => {
        this.revalidateCartService.setRevalidateLines();
        this.loading = false;
        this.modalRef.hide();
        this.loadView();
      },
      err => {
        this.loading = false;
        this.translateService.stream('MY_ACCOUNT.CART_LIST.CART_CREATION_FAILED').subscribe((val: string) => {
          this.message = val;
        });
      }
    );
  }

  getCartTotal(currentCart: Cart) {
    return this.priceService.getCartPrice(currentCart).pipe(mergeMap((price) => { return price.netPrice$; }));
  }


  canDelete(cartToDelete: Cart) {
    return (cartToDelete.Status !== 'Finalized');
  }


  canActivate(cartToActivate: Cart) {
    return (CartService.getCurrentCartId() !== cartToActivate.Id && cartToActivate.Status !== 'Finalized');
  }



  getFilters(): Array<AFilter> {
    return new Array(new AFilter(this.cartService.type, [
      new ACondition(this.cartService.type, 'Status', 'NotEqual', 'Saved')
    ]));
  }

  setCartActive(record): Observable<Cart> {
    return this.cartService.setCartActive(record, true).pipe(
      tap(() => this.revalidateCartService.setRevalidateLines())
    );
  }

}

interface CartListView {
  tableOptions: TableOptions;
  type: ClassType<AObject>;
}