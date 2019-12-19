import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as moment from 'moment';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Observable, zip, of } from 'rxjs';
import { AccountService, ContactService, UserService, Quote, QuoteService, Cart, NoteService, Note, Account } from '@apttus/ecommerce';
import { map, take } from 'rxjs/operators';
import * as _ from 'lodash';
import { LookupOptions } from '@apttus/elements';

@Component({
  selector: 'app-request-quote-form',
  templateUrl: './request-quote-form.component.html',
  styleUrls: ['./request-quote-form.component.scss']
})
export class RequestQuoteFormComponent implements OnInit {
  @Input() cart: Cart;
  @Output() onQuoteUpdate = new EventEmitter<Quote>();

  quote = new Quote();
  bsConfig: Partial<BsDatepickerConfig>;
  startDate: Date = new Date();
  rfpDueDate: Date = new Date();
  _moment = moment;
  note: Note = new Note();
  comments: any =[];

  shipToAccount$: Observable<Account>;
  billToAccount$: Observable<Account>;
  lookupOptions: LookupOptions = {
    primaryTextField: 'Name',
    secondaryTextField: 'Email'
  };

  constructor(public quoteService: QuoteService, private accountService: AccountService, private userService :UserService, private noteService:NoteService
    , private contactService: ContactService) { }

  ngOnInit() {
    this.quote.Name = 'Test';
    zip(this.accountService.getCurrentAccount(), this.userService.me(),(this.cart.Quote? this.quoteService.get([this.cart.Quote.Id]) : of(null))).pipe(take(1)).subscribe(([account, user, quote]) => {
        this.quote.ShipToAccount = account;
        this.quote.ShipToAccountId =  account.Id;
        this.quote.BillToAccount = account;
        this.quote.BillToAccountId =  account.Id;
        this.quote.PrimaryContact = user.Contact;
        this.quote.PrimaryContactId = (user && user.ContactId) ? user.ContactId : null;
        if(_.get(this.cart, 'Quote.Id')) {
          this.quote = _.get(this.cart, 'Quote');
          this.comments = _.get(quote, '[0].Notes', []);
        }
        this.quoteChange();
    });
  }

  /**
   * This method adds comments to requesting quote.
   */
  addComment() {
    if (this.quote) {
      if (!this.quote.Notes)
        this.quote.Notes = Array<Note>();
      this.quote.Notes[0] = this.note;
      this.onQuoteUpdate.emit(this.quote);
    }
  }

  /**
   * @ignore
   */
  quoteChange() {
    this.onQuoteUpdate.emit(this.quote);
  }

  shipToChange() {
    this.shipToAccount$ = this.accountService.get([this.quote.ShipToAccountId]).pipe(map(res => res[0]));
    this.shipToAccount$.pipe(take(1)).subscribe((newShippingAccount) => { 
      this.quote.ShipToAccount = newShippingAccount; 
      this.onQuoteUpdate.emit(this.quote);
    });
  }

  billToChange() {
    this.billToAccount$ = this.accountService.get([this.quote.BillToAccountId]).pipe(map(res => res[0]));
    this.billToAccount$.pipe(take(1)).subscribe((newBillingAccount) => { 
      this.quote.BillToAccount = newBillingAccount;
      this.onQuoteUpdate.emit(this.quote);
    });
    
  }

  primaryContactChange() {
    this.contactService.get([this.quote.PrimaryContactId]).pipe(map(res => res[0]))
      .pipe(take(1))
      .subscribe((newPrimaryContact) => { 
        this.quote.PrimaryContact = newPrimaryContact;
        this.onQuoteUpdate.emit(this.quote);
      });
  }

  /**
   * Event handler for when the primary contact input changes.
   * @param event The event that was fired.
   */
  handlePrimaryContactChange(event: any) {}
  
}
