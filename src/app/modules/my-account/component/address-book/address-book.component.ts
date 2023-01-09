import { Component, OnInit, TemplateRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { AccountLocationService, AccountLocation } from '@congacommerce/ecommerce';
import { Observable } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styles: [`
    .info{
      margin: -10px -10px 0 0;
    }
    .set-dropdown-for-address{
      left: auto !important;
      right: 0px !important;
    }
  `],
  providers: [],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AddressBookComponent implements OnInit {
  modalRef: BsModalRef;
  addressList$: Observable<Array<AccountLocation>>;
  addressEdit: AccountLocation;
  addressLocation: AccountLocation;
  loading: boolean = false;
  message: string = null;

  constructor(private accountLocationService: AccountLocationService, private modalService: BsModalService, private ngZone: NgZone, private translateService: TranslateService) { }

  ngOnInit() {
    this.addressList$ = this.accountLocationService.getAccountLocations();
  }

  newAddress(template: TemplateRef<any>) {
    this.addressEdit = new AccountLocation();
    this.addressLocation = this.addressEdit;
    this.message = null;
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  saveAddress() {
    this.ngZone.run(() => this.loading = true);
    const requestBody = _.cloneDeep(this.addressLocation);
    requestBody.Name = this.addressEdit.Name;
    this.accountLocationService.saveLocationToAccount(requestBody)
      .subscribe(
        res => {
          this.loading = false;
          this.modalRef.hide();
        },
        err => {
          console.error(err);
          this.translateService.stream('MY_ACCOUNT.ADDRESS_BOOK.SAVE_FAILED').subscribe((val: string) => {
            this.message = val;
          });
          this.loading = false;
        }
      );
  }

  setAsDefault(location: AccountLocation) {
    _.set(location, '_metadata.loading', true);
    this.accountLocationService.setLocationAsDefault(location).subscribe(
      r => { },
      e => console.error(e)
    );
  }

  deleteAddress(location: AccountLocation) {
    _.set(location, '_metadata.loading', true);
    this.accountLocationService.delete([location]).subscribe(
      r => { },
      e => console.error(e)
    );
  }

  edit(location: AccountLocation, template: TemplateRef<any>) {
    this.addressEdit = location;
    this.addressLocation = _.cloneDeep(this.addressEdit);
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }
}
