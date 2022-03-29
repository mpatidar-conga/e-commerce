
import {combineLatest,  Observable } from 'rxjs';
import {mergeMap, map, filter} from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { BatchSelectionService } from '@congacommerce/elements';

@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
      <apt-product-drawer *ngIf="showDrawer$ | async"></apt-product-drawer>
    </main>
    `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  private subs: Array<any> = [];
  showHeader: boolean = true;
  showDrawer$: Observable<boolean>;
  ready: boolean = false;

  constructor(private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private batchSelectionService: BatchSelectionService) {
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap(r => combineLatest(r.data, r.params)),)
      .subscribe(([data, params]) => {
        if (params && Object.keys(params).length > 0)
          this.titleService.setTitle('Conga: ' + params[Object.keys(params)[0]]);
        else if (_.get(data, 'title'))
          this.titleService.setTitle('Conga: ' + _.get(data, 'title'));
        else
          this.titleService.setTitle('Conga: B2B E-commerce');
      });

    this.showDrawer$ = this.batchSelectionService.getSelectedProducts()
      .pipe(map(productList => _.get(productList, 'length', 0) > 0));
  }

  ngOnDestroy() {
    if (this.subs.length > 0) {
      this.subs.forEach(sub => sub.unsubscribe());
    }
  }

}

