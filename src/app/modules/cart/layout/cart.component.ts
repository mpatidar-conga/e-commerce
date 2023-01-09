import { Component, OnInit, ViewChild, ElementRef, TemplateRef, OnDestroy, NgZone } from '@angular/core';
import { User, Account, Cart, CartService, Order, OrderService, Contact, ContactService, UserService, AccountService, EmailService, PaymentTransaction, AccountInfo } from '@congacommerce/ecommerce';
import { Observable, Subscription } from 'rxjs';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Card } from '../component/card-form/card-form.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { map, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { get, uniqueId, find, defaultTo, toString, round } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from '@congacommerce/core';
import { ExceptionService, PriceSummaryComponent, BreadcrumbLink } from '@congacommerce/elements';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  @ViewChild('addressTabs') addressTabs: any;
  @ViewChild('addressInfo') addressInfo: ElementRef;
  @ViewChild('staticTabs') staticTabs: TabsetComponent;
  @ViewChild('confirmationTemplate') confirmationTemplate: TemplateRef<any>;
  @ViewChild('priceSummary') priceSummary: PriceSummaryComponent;

  primaryContact: Contact;
  shippingEqualsBilling: boolean = true;
  order: Order;
  orderConfirmation: Order;
  card: Card;
  loading: boolean = false;
  uniqueId: string;
  paymentState: 'PONUMBER' | 'INVOICE' | 'PAYNOW' | '' = '';
  confirmationModal: BsModalRef;
  user$: Observable<User>;
  account$: Observable<Account>;
  currentUserLocale: string;
  isPaymentCompleted: boolean = false;
  isPayForOrderEnabled: boolean = false;
  isMakePaymentRequest: boolean = false;
  paymentTransaction: PaymentTransaction;
  orderAmount: string;
  errMessages: any = {
    requiredFirstName: '',
    requiredLastName: '',
    requiredEmail: ''
  };
  cart: Cart;
  isLoggedIn: boolean;
  shipToAccount$: Observable<Account>;
  billToAccount$: Observable<Account>;
  pricingSummaryType: 'checkout' | 'paymentForOrder' | '' = 'checkout';
  model = {
    BillToAccountId: '',
    ShipToAccountId: '',
    SoldToAccountId: ''
  };
  breadcrumbs;

  private subscriptions: Subscription[] = [];

  constructor(private cartService: CartService,
    public configurationService: ConfigurationService,
    private orderService: OrderService,
    private modalService: BsModalService,
    public contactService: ContactService,
    private translate: TranslateService,
    private userService: UserService,
    private accountService: AccountService,
    private emailService: EmailService,
    private router: Router,
    private ngZone: NgZone,
    private toastr: ToastrService,
    private exceptionService: ExceptionService) {
    this.uniqueId = uniqueId();
  }

  ngOnInit() {
    this.subscriptions.push(this.userService.isLoggedIn().subscribe(isLoggedIn => this.isLoggedIn = isLoggedIn));
    this.subscriptions.push(this.userService.getCurrentUserLocale(false).subscribe((currentLocale) => this.currentUserLocale = currentLocale));

    if (!this.isLoggedIn)
      this.paymentState = 'PAYNOW';

    this.subscriptions.push(this.cartService.getMyCart().subscribe(cart => {
      this.cart = cart;
      // Setting default values
      this.model.BillToAccountId = get(cart, 'AccountId');
      this.model.ShipToAccountId = get(cart, 'AccountId');
      this.model.SoldToAccountId = get(cart, 'AccountId');
    }));
    this.subscriptions.push(this.contactService.getMyContact().subscribe(c => this.primaryContact = c));
    this.order = new Order();
    this.card = {} as Card;
    this.user$ = this.userService.me();
    this.translate.stream(['PRIMARY_CONTACT', 'AOBJECTS']).subscribe((val: string) => {
      this.errMessages.requiredFirstName = val['PRIMARY_CONTACT']['INVALID_FIRSTNAME'];
      this.errMessages.requiredLastName = val['PRIMARY_CONTACT']['INVALID_LASTNAME'];
      this.errMessages.requiredEmail = val['PRIMARY_CONTACT']['INVALID_EMAIL'];
      this.breadcrumbs = [
        {
          label: val['AOBJECTS']['CART'],
          route: [`/carts/active`]
        }
      ];
    });

    this.onBillToChange();
    this.onShipToChange();
  }

  selectTab(evt) {
    if (evt)
      this.staticTabs.tabs[0].active = true;
    else {
      setTimeout(() => this.staticTabs.tabs[1].active = true, 50);
    }
  }

  submitOrder() {
    const orderAmountGroup = find(get(this.cart, 'SummaryGroups'), c => get(c, 'LineType') === 'Grand Total');
    this.orderAmount = defaultTo(get(orderAmountGroup, 'NetPrice', 0).toString(), '0');
    this.loading = true;
    if (this.isLoggedIn) {
      let selectedAcc: AccountInfo = {
        BillToAccountId: this.model.BillToAccountId,
        ShipToAccountId: this.model.ShipToAccountId,
        SoldToAccountId: this.model.SoldToAccountId
      };

      this.convertCartToOrder(this.order, this.primaryContact, null, selectedAcc);
    }
    else {
      if (this.shippingEqualsBilling) {
        this.primaryContact.OtherCity = this.primaryContact.MailingCity;
        this.primaryContact.OtherStreet = this.primaryContact.MailingStreet;
        this.primaryContact.OtherState = this.primaryContact.MailingState;
        this.primaryContact.OtherStateCode = this.primaryContact.MailingStateCode;
        this.primaryContact.OtherPostalCode = this.primaryContact.MailingPostalCode;
        this.primaryContact.OtherCountryCode = this.primaryContact.MailingCountryCode;
        this.primaryContact.OtherCountry = this.primaryContact.MailingCountry;
      }

      this.convertCartToOrder(this.order, this.primaryContact);
    }
  }

  public getId(id: string): string {
    return this.uniqueId + '_' + id;
  }

  onBillToChange() {
    if (this.model.BillToAccountId)
      this.billToAccount$ = this.accountService.getAccount(this.model.BillToAccountId);
  }

  onShipToChange() {
    if (this.model.ShipToAccountId)
      this.shipToAccount$ = this.accountService.getAccount(this.model.ShipToAccountId);
  }

  convertCartToOrder(order: Order, primaryContact: Contact, cart?: Cart, selectedAccount?: AccountInfo) {
    this.loading = true;
    this.orderService.convertCartToOrder(order, primaryContact, cart, selectedAccount)
      .subscribe(
        orderResponse => this.ngZone.run(() => {
          this.loading = false;
          this.orderConfirmation = orderResponse;
          (this.paymentState === 'PAYNOW') ? this.requestForPayment(this.orderConfirmation) : this.onOrderConfirmed();
        }),
        err => {
          this.exceptionService.showError(err);
          this.loading = false;
        }
      );
  }

  requestForPayment(orderDetails: Order) {
    this.paymentTransaction = new PaymentTransaction();
    this.paymentTransaction.Currency = defaultTo(get(orderDetails, 'CurrencyIsoCode'), this.configurationService.get('defaultCurrency'));
    this.paymentTransaction.CustomerFirstName = get(this.primaryContact, 'FirstName');
    this.paymentTransaction.CustomerLastName = get(this.primaryContact, 'LastName');
    this.paymentTransaction.CustomerEmailAddress = get(this.primaryContact, 'Email');
    this.paymentTransaction.CustomerAddressLine1 = this.isLoggedIn ? get(orderDetails.BillToAccount, 'BillingStreet') : get(this.primaryContact, 'MailingStreet');
    this.paymentTransaction.CustomerAddressCity = this.isLoggedIn ? get(orderDetails.BillToAccount, 'BillingCity') : get(this.primaryContact, 'MailingCity');
    this.paymentTransaction.CustomerAddressStateCode = this.isLoggedIn ? get(orderDetails.BillToAccount, 'BillingAddress.stateCode') : get(this.primaryContact, 'MailingStateCode');
    this.paymentTransaction.CustomerAddressCountryCode = this.isLoggedIn ? get(orderDetails.BillToAccount, 'BillingAddress.countryCode') : get(this.primaryContact, 'MailingCountryCode');
    this.paymentTransaction.CustomerAddressPostalCode = this.isLoggedIn ? get(orderDetails.BillToAccount, 'BillingAddress.postalCode') : get(this.primaryContact, 'MailingPostalCode');
    this.paymentTransaction.CustomerBillingAccountName = get(orderDetails.BillToAccount, 'Name');
    this.paymentTransaction.CustomerBillingAccountID = get(orderDetails.BillToAccount, 'Id');
    this.paymentTransaction.isUserLoggedIn = this.isLoggedIn;
    // Rounding off the string amount to 2 decimal places as cybersource doesn't allow higher numeric scale on order amount.
    this.paymentTransaction.OrderAmount = toString(round(parseFloat(this.orderAmount), 2));
    this.paymentTransaction.Locale = this.currentUserLocale;
    this.paymentTransaction.OrderName = get(orderDetails, 'Name');
    this.paymentTransaction.OrderGeneratedID = get(orderDetails, 'Id');
    this.isPayForOrderEnabled = true;
    this.pricingSummaryType = '';
  }

  submitPayment() {
    this.isMakePaymentRequest = true;
    this.priceSummary.setLoading(true);
  }

  selectDefaultPaymentOption(isPaymentMethodExist) {
    if (isPaymentMethodExist) {
      this.paymentState = 'PAYNOW';
    }
    else {
      this.paymentState = '';
    }
  }

  onSelectingPaymentMethod(eve) {
    setTimeout(() => {
      if (eve) {
        this.pricingSummaryType = 'paymentForOrder';
      }
      else {
        this.pricingSummaryType = '';
      }
    });
  }

  onPaymentComplete(paymentStatus: string) {
    if (paymentStatus !== 'Success') {
      this.translate.stream(['PAYMENT_METHOD_LABELS.ERROR_MSG', 'PAYMENT_METHOD_LABELS.ERROR_TITLE']).subscribe((val: string) => {
        this.toastr.error(val['PAYMENT_METHOD_LABELS.ERROR_MSG'] + paymentStatus, val['PAYMENT_METHOD_LABELS.ERROR_TITLE']);
      });
    }
    else {
      this.isPaymentCompleted = true;
    }
    if (get(this.orderConfirmation, 'Id'))
      this.emailService.guestUserNewOrderNotification(this.orderConfirmation.Id, `${this.configurationService.resourceLocation()}#/orders/${this.orderConfirmation.Id}`).pipe(take(1)).subscribe();
  }

  redirectOrderPage() {
    this.ngZone.run(() => {
      this.router.navigate(['/orders', this.orderConfirmation.Id]);
    });
  }

  onOrderConfirmed() {
    this.ngZone.run(() => {
      this.confirmationModal = this.modalService.show(this.confirmationTemplate, { class: 'modal-lg' });
    });
    if (get(this.orderConfirmation, 'Id'))
      this.emailService.guestUserNewOrderNotification(this.orderConfirmation.Id, `${this.configurationService.resourceLocation()}#/orders/${this.orderConfirmation.Id}`).pipe(take(1)).subscribe();
  }

  closeModal() {
    this.confirmationModal.hide();
    this.redirectOrderPage();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}