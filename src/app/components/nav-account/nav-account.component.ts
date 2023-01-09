import { Component, OnInit } from '@angular/core';
import { AccountService, Account } from '@congacommerce/ecommerce';
import { Observable } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'nav-account',
  templateUrl: './nav-account.component.html',
  styleUrls: ['./nav-account.component.scss']
})
export class NavAccountComponent implements OnInit {
  account$: Observable<Account>;
  selectedAccount$: Observable<Account>;

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    this.account$ = this.accountService.getMyAccount();
    this.selectedAccount$ = this.accountService.getCurrentAccount();
  }

  setAccount(account: Account){
    this.accountService.setAccount(account, true).subscribe(r => console.log(r));
  }

}
