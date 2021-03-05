import { Component, OnInit, HostListener, ViewChild, ElementRef, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { Category, Storefront, ContactService, StorefrontService,
  UserService, CurrencyType, User, ProductService, Product, Contact } from '@apttus/ecommerce';

import { MiniProfileComponent } from '@apttus/elements';

import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { APageInfo, ConfigurationService } from '@apttus/core';
import { TranslateService } from '@ngx-translate/core';

import * as _ from 'lodash';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  @ViewChild('searchModal') searchModal: ElementRef;
  @ViewChild('profile') profile: MiniProfileComponent;
  @ViewChild('searchBox') searchBox: ElementRef;

  searchQuery: string;
  postalCode: number;
  pageTop: boolean = true;
  modalRef: BsModalRef;

  typeahead$: Observable<Array<Product>> = new Observable<Array<Product>>();
  typeaheadLoading: boolean = false;
  keyupEvent: any;


  storefront$: Observable<Storefront>;
  user$: Observable<User>;
  categoryTree$: Observable<Array<Category>>;
  categoryBranch$: Observable<Array<Category>>;
  contact$: Observable<Contact>;

  constructor(private storefrontService: StorefrontService,
              private userService: UserService,
              private router: Router,
              private productService: ProductService,
              private config: ConfigurationService,
              private contactService: ContactService,
              private modalService: BsModalService,
              private translateService: TranslateService) {
                
                this.typeahead$ = Observable.create((observer: any) => {
                  observer.next(this.searchQuery);
                }).pipe(
                  switchMap((query: string) => {
                    return this.productService.query({
                      searchString: query,
                      page: new APageInfo(5, 0),
                      groupBy: ['Name', 'Id', 'IconId', 'ProductCode']
                    });
                  })
                );
  }

  ngOnInit() {
    this.storefront$ = this.storefrontService.getStorefront();
    this.contact$ = this.contactService.getMyContact();
    this.user$ = this.userService.me();
  }

  openModal(template: TemplateRef<any>) {
    this.searchQuery = '';
    this.modalRef = this.modalService.show(template);
  }

  setCurrency(currency: CurrencyType){
    this.userService.setCurrency(currency.IsoCode).subscribe(() => {});
  }

  setLanguage(lang: string) {
    this.translateService.use(lang);
    localStorage.setItem('locale', lang);
  }

  setStorefront(storefront: Storefront){
    this.modalRef.hide();
    this.storefrontService.cacheService._set('storefront', storefront.Id, true);
    window.location.reload();
  }

  onSubmit(){
    this.router.navigate(['/search', this.searchQuery]);
  }

  typeaheadOnSelect(evt){
    this.modalRef.hide();
    this.typeaheadLoading = false;
    this.router.navigate(['/products', evt.item[this.config.get('productIdentifier')]]);
  }

  goToAddress(){
     this.router.navigate(['/address']);
  }

  doSearch(){
    this.modalRef.hide();
    this.typeaheadLoading = false;
    if(this.searchQuery) this.router.navigate(['/search', this.searchQuery]);
  }

  doLogout(){
    this.profile.doLogout();
    this.router.navigate(['/']);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event){
      this.pageTop = window.pageYOffset <= 0;
  }
}
