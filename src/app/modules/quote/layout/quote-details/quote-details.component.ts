import { Component, OnInit, ViewChild, TemplateRef, NgZone, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import {
  UserService, QuoteService, Quote, Order, OrderService, Note, NoteService, AttachmentService,
  ProductInformationService, ItemGroup, LineItemService, Attachment, QuoteLineItemService, Account, AccountService, QuoteLineItem
} from '@congacommerce/ecommerce';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, take, mergeMap, switchMap, startWith, tap } from 'rxjs/operators';
import { get, set, compact, uniq, find, cloneDeep, sum, defaultTo } from 'lodash';
import { Observable, of, BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { ExceptionService, LookupOptions, RevalidateCartService } from '@congacommerce/elements';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ACondition, ApiService } from '@congacommerce/core';


@Component({
  selector: 'app-quote-details',
  templateUrl: './quote-details.component.html',
  styleUrls: ['./quote-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QuoteDetailsComponent implements OnInit, OnDestroy {

  quote$: BehaviorSubject<Quote> = new BehaviorSubject<Quote>(null);

  quoteLineItems$: BehaviorSubject<Array<ItemGroup>> = new BehaviorSubject<Array<ItemGroup>>(null);

  order$: Observable<Order>;

  note: Note = new Note();

  newlyGeneratedOrder: Order;

  intimationModal: BsModalRef;

  hasSizeError: boolean;

  file: File;

  uploadFileList: any;

  edit_loader: boolean = false;

  accept_loader: boolean = false;

  comments_loader: boolean = false;

  attachments_loader: boolean = false;

  attachmentList$: BehaviorSubject<Array<Attachment>> = new BehaviorSubject<Array<Attachment>>(null);

  noteList$: BehaviorSubject<Array<Note>> = new BehaviorSubject<Array<Note>>(null);

  notesSubscription: Subscription;

  attachmentSubscription: Subscription;

  quoteSubscription: Subscription;

  @ViewChild('intimationTemplate', { static: false }) intimationTemplate: TemplateRef<any>;

  lookupOptions: LookupOptions = {
    primaryTextField: 'Name',
    secondaryTextField: 'Email',
    fieldList: ['Id', 'Name', 'Email']
  };

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private quoteService: QuoteService,
    private noteService: NoteService,
    private exceptionService: ExceptionService,
    private modalService: BsModalService,
    private orderService: OrderService,
    private attachmentService: AttachmentService,
    private productInformationService: ProductInformationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private userService: UserService,
    private quoteLineItemService: QuoteLineItemService,
    private apiService: ApiService,
    private accountService: AccountService,
    private revalidateCartService: RevalidateCartService) { }

  ngOnInit() {
    this.getQuote();
  }

  getQuote() {
    if (this.quoteSubscription) {
      this.quoteSubscription.unsubscribe();
    }

    const quote$ = this.activatedRoute.params
      .pipe(
        filter(params => get(params, 'id') != null),
        map(params => get(params, 'id')),
        mergeMap(quoteId => this.apiService.get(`/quotes/${quoteId}?lookups=PriceListId,Primary_Contact,Account,CreatedBy`, Quote)),
        switchMap((quote: Quote) => combineLatest([of(quote),
        // Using query instead of get(), as get is not returning list of accounts as expected.
        this.accountService.query({
          conditions: [
            new ACondition(Account, 'Id', 'In', compact(uniq([quote.BillToAccountId, quote.ShipToAccountId, quote.AccountId, get(quote, 'PrimaryContact.AccountId')])))]
        })
        ])),
        map(([quote, accounts]) => {
          quote.Account = defaultTo(find(accounts, acc => acc.Id === quote.AccountId), quote.Account);
          quote.BillToAccount = defaultTo(find(accounts, acc => acc.Id === quote.BillToAccountId), quote.BillToAccount);
          quote.ShipToAccount = defaultTo(find(accounts, acc => acc.Id === quote.ShipToAccountId), quote.ShipToAccount);
          set(quote, 'Primary_Contact.Account', find(accounts, acc => quote.Primary_Contact && acc.Id === quote.Primary_Contact.AccountId));
          return quote;
        })
      );

    const quoteLineItems$ = this.activatedRoute.params
      .pipe(
        filter(params => get(params, 'id') != null),
        map(params => get(params, 'id')),
        mergeMap(quoteId => this.quoteLineItemService.getQuoteLineItems(quoteId)));

    this.quoteSubscription = combineLatest(quote$.pipe(startWith(null)), quoteLineItems$.pipe(startWith(null)))
      .pipe(map(([quote, lineItems]) => {
        if (!quote) return;
        quote.R00N70000001yUfBEAU = lineItems;
        lineItems && this.quoteLineItems$.next(LineItemService.groupItems(lineItems));
        this.order$ = this.orderService.getOrderByQuote(get(quote, 'Id'));
        this.ngZone.run(() => this.quote$.next(cloneDeep(quote)));
      })).subscribe();

    this.getNotes();
    this.getAttachments();
  }

  refreshQuote(fieldValue, quote, fieldName) {
    set(quote, fieldName, fieldValue);
    this.quoteService.update([quote]).subscribe(r => {
      this.getQuote();
    });
  }

  getNotes() {
    if (this.notesSubscription) this.notesSubscription.unsubscribe();
    this.notesSubscription = this.activatedRoute.params
      .pipe(
        switchMap(params => this.noteService.getNotes(get(params, 'id')))
      ).subscribe((notes: Array<Note>) => this.noteList$.next(notes));
  }

  addComment(quoteId: string) {
    this.comments_loader = true;

    set(this.note, 'ParentId', quoteId);
    set(this.note, 'OwnerId', get(this.userService.me(), 'Id'));
    if (!this.note.Title) {
      set(this.note, 'Title', 'Dummy Title');
    }
    this.noteService.create([this.note])
      .subscribe(r => {
        this.getNotes();
        this.clear();
        this.comments_loader = false;
      },
        err => {
          this.exceptionService.showError(err);
          this.comments_loader = false;
        });
  }

  clear() {
    set(this.note, 'Body', null);
    set(this.note, 'Title', null);
    set(this.note, 'Id', null);
  }

  acceptQuote(quoteId: string) {
    this.accept_loader = true;
    this.quoteService.acceptQuote(quoteId).pipe(take(1)).subscribe(
      res => {
        if (res) {
          this.accept_loader = false;
          const ngbModalOptions: ModalOptions = {
            backdrop: 'static',
            keyboard: false
          };
          this.ngZone.run(() => {
            this.intimationModal = this.modalService.show(this.intimationTemplate, ngbModalOptions);
          });
        }
      },
      err => {
        this.accept_loader = false;
      }
    );
  }

  editQuoteItems(quoteId: string) {
    this.edit_loader = true;
    this.quoteService.convertQuoteToCart(quoteId).pipe(
      tap(() => this.revalidateCartService.setRevalidateLines()),
      take(1)
    ).subscribe(res => {
      this.edit_loader = false;
      this.ngZone.run(() => this.router.navigate(['/carts', 'active']));
    },
      err => {
        this.exceptionService.showError(err);
        this.edit_loader = false;
      });
  }

  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.uploadFileList = event.target.files;
      this.hasFileSizeExceeded(this.uploadFileList, event.target.dataset.maxSize);
      this.file = fileList[0];
    }
  }

  hasFileSizeExceeded(fileList, maxSize) {
    let totalFileSize = 0;
    for (let i = 0; i < fileList.length; i++) {
      totalFileSize = totalFileSize + fileList[i].size;
    }
    this.hasSizeError = totalFileSize > maxSize;
  }

  onDragFile(event) {
    event.preventDefault();
  }

  onDropFile(event) {
    event.preventDefault();
    const itemList: DataTransferItemList = event.dataTransfer.items;
    const fileList: FileList = event.dataTransfer.files;
    if (fileList.length > 0) {
      this.uploadFileList = event.dataTransfer.files;
      this.hasFileSizeExceeded(this.uploadFileList, event.target.dataset.maxSize);
    } else {
      let f = [];
      for (let i = 0; i < itemList.length; i++) {
        if (itemList[i].kind === 'file') {
          let file: File = itemList[i].getAsFile();
          f.push(file);
        }
        this.uploadFileList = f;
      }
      this.hasFileSizeExceeded(fileList, event.target.dataset.maxSize);
    }
    this.file = this.uploadFileList[0];
  }

  clearFiles() {
    this.file = null;
    this.uploadFileList = null;
  }

  getAttachments() {
    if (this.attachmentSubscription) this.attachmentSubscription.unsubscribe();
    this.attachmentSubscription = this.activatedRoute.params
      .pipe(
        switchMap(params => this.attachmentService.getAttachments(get(params, 'id')))
      ).subscribe((attachments: Array<Attachment>) => this.ngZone.run(() => this.attachmentList$.next(attachments))
      );
  }

  uploadAttachment(parentId: string) {
    this.attachments_loader = true;
    this.attachmentService.uploadAttachment(this.file, parentId).pipe(take(1)).subscribe(res => {
      this.getAttachments();
      this.attachments_loader = false;
      this.clearFiles();
      this.cdr.detectChanges();
    }, err => {
      this.clearFiles();
      this.exceptionService.showError(err);
    });
  }

  downloadAttachment(attachmentId: string, parentId: string) {
    return this.productInformationService.getAttachmentUrl(attachmentId, parentId);
  }

  getTotalPromotions(quote: Quote): number {
    return ((get(quote, 'QuoteLineItems.length') > 0)) ? sum(get(quote, 'QuoteLineItems').map(res => res.IncentiveAdjustmentAmount)) : 0;
  }

  closeModal() {
    this.intimationModal.hide();
    this.quoteService.where([new ACondition(Quote, 'Id', 'In', this.activatedRoute.snapshot.params.id)], 'AND', null, null, null, null, true).subscribe(res => {
      this.quote$.next(res[0]);
    });
  }

  ngOnDestroy() {
    if (this.notesSubscription)
      this.notesSubscription.unsubscribe();
    if (this.attachmentSubscription)
      this.attachmentSubscription.unsubscribe();
    if (this.quoteSubscription)
      this.quoteSubscription.unsubscribe();
  }
}