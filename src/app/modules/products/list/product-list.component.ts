import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService, Category, ProductResult, SearchService, ProductService, Cart, CartService } from '@congacommerce/ecommerce';
import { get, compact, map, isNil, remove, isEqual, isEmpty, filter, includes, some } from 'lodash';
import { ACondition, AJoin } from '@congacommerce/core';
import { Observable, of, BehaviorSubject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { map as rmap, mergeMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {

  page = 1;
  pageSize = 12;
  view = 'grid';
  sortField: string = 'Relevance';
  productFamilyFilter: ACondition;
  conditions: Array<ACondition> = new Array<ACondition>();
  subCategories: Array<Category> = [];
  joins: Array<AJoin> = new Array<AJoin>();
  searchString: string = null;
  data$: BehaviorSubject<ProductResult> = new BehaviorSubject<ProductResult>(null);
  productFamilies$: Observable<Array<string>> = new Observable<Array<string>>();
  cart$: Observable<Cart>;
  category: Category;
  subscription: Subscription;
  hasSearchError: boolean;

  paginationButtonLabels: any = {
    first: '',
    previous: '',
    next: '',
    last: ''
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private searchService: SearchService,
    private categoryService: CategoryService,
    private router: Router,
    public productService: ProductService,
    private translateService: TranslateService,
    private cartService: CartService
  ) { }

  ngOnDestroy() {
    if (!isNil(this.subscription))
      this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.getResults();
    this.cart$ = this.cartService.getMyCart();
    this.productFamilies$ = this.productService.query({ groupBy: ['Family'] })
      .pipe(
        rmap(productList => compact(map(productList, 'Family')))
      );

    this.translateService.stream('PAGINATION').subscribe((val: string) => {
      this.paginationButtonLabels.first = val['FIRST'];
      this.paginationButtonLabels.previous = val['PREVIOUS'];
      this.paginationButtonLabels.next = val['NEXT'];
      this.paginationButtonLabels.last = val['LAST'];
    });
  }

  getResults() {
    this.ngOnDestroy();
    this.subscription = this.activatedRoute.params.pipe(
      mergeMap(params => {
        this.data$.next(null);
        this.hasSearchError = false;
        this.searchString = get(params, 'query');
        let categories = null;
        const sortBy = this.sortField === 'Name' ? this.sortField : null;
        if (!isNil(get(params, 'categoryId')) && isEmpty(this.subCategories)) {
          this.category = new Category();
          this.category.Id = get(params, 'categoryId');
          categories = [get(params, 'categoryId')];
        } else if (!isEmpty(this.subCategories)) {
          categories = this.subCategories.map(category => category.Id);
        }

        if (get(this.searchString, 'length') < 3) {
          this.hasSearchError = true;
          return of(null);
        } else {
          return this.productService.getProducts(categories, this.pageSize, this.page, sortBy, 'ASC', this.searchString, this.conditions);
        }
      }),
    ).subscribe(r => {
      this.data$.next(r);
    });

  }

  scrollTop() {
    const c = document.documentElement.scrollTop || document.body.scrollTop;
    if (c > 0) {
      window.requestAnimationFrame(this.scrollTop);
      window.scrollTo(0, c - c / 8);
    }
  }

  onCategory(categoryList: Array<Category>) {
    const category = get(categoryList, '[0]');
    if (category) {
      this.subCategories = [];
      this.page = 1;
      this.router.navigate(['/products/category', category.Id]);
    }
  }

  onPage(evt) {
    if (get(evt, 'page') !== this.page) {
      this.page = evt.page;
      this.getResults();
    }
  }

  onPriceTierChange(evt) {
    this.page = 1;
    this.getResults();
  }

  onSubcategoryFilter(categoryList: Array<Category>) {
    this.subCategories = categoryList;
    this.page = 1;
    this.getResults();
  }

  onFilterAdd(condition: ACondition) {
    remove(this.conditions, (c) => isEqual(c, condition));
    this.page = 1;

    this.conditions.push(condition);
    this.getResults();
  }

  onFilterRemove(condition: ACondition) {
    remove(this.conditions, (c) => isEqual(c, condition));
    this.page = 1;
    this.getResults();
  }

  onFieldFilter(evt: ACondition) {
    this.page = 1;
    this.getResults();
  }

  onSortChange(evt) {
    this.page = 1;
    this.sortField = evt;
    this.getResults();
  }

  onPageSizeChange(event) {
    this.pageSize = event;
    this.getResults();
  }

  handlePicklistChange(event: any) {
    if (this.productFamilyFilter) remove(this.conditions, this.productFamilyFilter);
    if (event.length > 0) {
      let values = [];
      event.forEach(item => values.push(item));
      this.productFamilyFilter = new ACondition(this.productService.type, 'Family', 'In', values);
      this.conditions.push(this.productFamilyFilter);
    }
    this.getResults();
  }

}
