import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Product, Storefront, StorefrontService, CategoryService, ProductService, Category, CartService, Cart } from '@congacommerce/ecommerce';
import { first, get, slice, reverse, sortBy, last, isNil } from 'lodash';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  storefront$: Observable<Storefront>;

  productListA$: Observable<Array<Product>>;

  productListB$: Observable<Array<Product>>;

  categories: Array<Category>;
  cart$: Observable<Cart>;

  constructor(private storefrontService: StorefrontService,
    private cartService:CartService, private categoryService: CategoryService, private productService: ProductService) {
  }

  ngOnInit() {
    this.storefront$ = this.storefrontService.getStorefront();
    this.cart$ =  this.cartService.getMyCart();
    this.categoryService.getCategories()
      .pipe(
        take(1)
      ).subscribe(categoryList => {
        this.categories = slice(reverse(sortBy(categoryList, 'ProductCount')), 0, 2);
        this.productListA$ = this.productService.getProducts([get(first(this.categories),'Id')], 5, 1).pipe(map(results => get(results, 'Products')));
        this.productListB$ = this.productService.getProducts([get(last(this.categories), 'Id')], 5, 1).pipe(map(results => get(results, 'Products')));
      });
  }
}