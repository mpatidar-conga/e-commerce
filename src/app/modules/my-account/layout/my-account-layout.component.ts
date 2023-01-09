import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigurationService } from '@congacommerce/core';
import { UserService, User, Cart, CartService, StorefrontService } from '@congacommerce/ecommerce';

@Component({
  selector: 'app-my-account-layout',
  templateUrl: './my-account-layout.component.html',
  styleUrls: ['./my-account-layout.component.scss']
})
export class MyAccountLayoutComponent implements OnInit {

  me$: Observable<User>;
  isAIC: boolean = false;
  cart$: Observable<Cart>;
  showFavorites$: Observable<boolean>;

  constructor(
    private userService: UserService,
    private config: ConfigurationService,
    private cartService: CartService,
    private storefrontService: StorefrontService
  ) { }

  ngOnInit() {
    this.me$ = this.userService.me();
    this.isAIC = this.config.platform() === 'AIC';
    this.cart$ = this.cartService.getMyCart();
    this.showFavorites$ = this.storefrontService.isFavoriteDisabled().pipe(map(res => !res));
  }

}
