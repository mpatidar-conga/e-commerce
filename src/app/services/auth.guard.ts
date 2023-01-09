
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '@congacommerce/ecommerce';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private userService: UserService) { }

   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.userService.isLoggedIn().pipe(map(res => {
            if(res)
                return true;
            else{
                return this.redirectUrl(route, state.url);
            }
        }));
    }

    redirectUrl(route: ActivatedRouteSnapshot,url: string): boolean {
        // Store the attempted URL for redirecting
       let params: Params={};
       if(url) params.redirectUrl = window.location.href;
       if(url.includes('/proposals')) {
           return this.redirectToLogin(params);
       }
        // Navigate to the login page with extras
        this.router.navigate(['/'], {
            queryParams: params ? params : route.queryParams,
            queryParamsHandling: 'merge',
        });
        return false;
      }
    
      redirectToLogin(redirectQueryParams){
        this.router.navigate(['/login'], {
            queryParams: redirectQueryParams,
            queryParamsHandling: 'merge',
        });
        return false;
      }
}