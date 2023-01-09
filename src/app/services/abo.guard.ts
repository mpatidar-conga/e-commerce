
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService, StorefrontService } from '@congacommerce/ecommerce';
import { Observable, combineLatest } from 'rxjs';

@Injectable()
export class AboGuard implements CanActivate {

  constructor(private router: Router, private userService: UserService, private storefrontService: StorefrontService) { }

  canActivate(): Observable<boolean> {
    return combineLatest([this.storefrontService.getStorefront(), this.userService.isLoggedIn()])
      .pipe(map(([storefront, isLoggednIn]) => {
        if (isLoggednIn) {
          if (storefront.EnableABO) return true;
          else {
            this.router.navigate(['/']);
          }
        }
        else {
          return false;
        }
      }));
  }
}