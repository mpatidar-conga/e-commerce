import { Component, OnInit, TemplateRef, NgZone,ChangeDetectionStrategy} from '@angular/core';
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
  /**
   * List of Addresses for logged in user.
   */
  addressList$: Observable<Array<AccountLocation>>;
  addressEdit: AccountLocation;
  addressLocation: AccountLocation;
  loading: boolean = false;
  message: string = null;

  /**
   * @ignore
  */
  constructor(private accountLocationService: AccountLocationService, private modalService: BsModalService, private ngZone: NgZone, private translateService: TranslateService) { }

  /**
   * @ignore
  */
  ngOnInit() {
    this.addressList$ = this.accountLocationService.getAccountLocations();
  }

  /**
   * This will create new address with given input values when clicked save button from Modal template.
   * @param template Modal template editing purpose.
   */
  newAddress(template: TemplateRef<any>) {
    this.addressEdit = new AccountLocation();
    this.addressLocation = this.addressEdit;
    this.message = null;
    this.modalRef = this.modalService.show(template, { class : 'modal-lg'});
  }

  /**
   * @ignore
  */
  saveAddress(){
    this.ngZone.run(() => this.loading = true);
    const requestBody = _.cloneDeep(this.addressLocation);
    requestBody.Name= this.addressEdit.Name;
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

  /**
   * Sets default address for logged in user.
   * @param location Account lcoation to set it as default for logged in user.
   */
  setAsDefault(location: AccountLocation){
    _.set(location, '_metadata.loading', true);
    this.accountLocationService.setLocationAsDefault(location).subscribe(
      r => {},
      e => console.error(e)
    );
  }

  /**
   * Deletes given address for logged in user.
   * @param location Account location to be deleted for logged in user.
   */
  deleteAddress(location: AccountLocation){
    _.set(location, '_metadata.loading', true);
    this.accountLocationService.delete([location]).subscribe(
      r => {},
      e => console.error(e)
    );
  }

  /**
   * Updates selected address for logged in user after Save button cliked on modal template.
   * @param location Account location to be updated for logged in user.
   * @param template Modal template editing purpose.
   */
  edit(location: AccountLocation, template: TemplateRef<any>){
    this.addressEdit = location;
    this.addressLocation = _.cloneDeep(this.addressEdit);
    this.modalRef = this.modalService.show(template, { class : 'modal-lg'});
  }
}
