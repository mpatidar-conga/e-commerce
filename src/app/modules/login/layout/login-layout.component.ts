import { Component, NgZone } from '@angular/core';
import { UserService } from '@congacommerce/ecommerce';
import { CacheService } from '@congacommerce/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { get, last } from 'lodash';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login-layout',
  templateUrl: './login-layout.component.html',
  styleUrls: ['./login-layout.component.scss']
})

export class LoginLayoutComponent {
  username: string;
  password: string;
  loading: boolean = false;
  loginMessage: string;

  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private cacheService: CacheService,
    private ngZone: NgZone
  ) { }

  login() {
    this.loading = true;
    combineLatest([this.userService.login(this.username, this.password), this.activatedRoute.queryParams])
      .pipe(take(1))
      .subscribe(
        res => {
          if (get(last(res), 'redirectUrl')) {
            window.location.href = get(last(res), 'redirectUrl');
            if ((!!window.location.hash)) window.location.reload(true);
          } else
            window.location.reload(true)
        },
        err => this.ngZone.run(() => {
          this.loading = false;
          this.translateService.stream('LOGIN').subscribe((val: string) => {
            this.loginMessage = val['WRONG_CREDENTIALS'];
          });
        })
      );
  }

}
