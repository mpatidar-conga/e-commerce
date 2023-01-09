import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { first, isArray, sumBy, get, mapValues, omit, groupBy, zipObject, map as rmap } from 'lodash';
import { map, take, tap } from 'rxjs/operators';

import { ACondition, AFilter } from '@congacommerce/core';
import { OrderService, Order, UserService, User } from '@congacommerce/ecommerce';
import { TableOptions } from '@congacommerce/elements';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  type = Order;
  
  private recentOrders$: Observable<boolean>;
  user$: Observable<User>;
  totalOrderAmount$: Observable<number>;
  totalRecords$: Observable<number>;
  orderAmountByStatus$: Observable<number>;

  colorPalette = ['#D22233', '#F2A515', '#6610f2', '#008000', '#17a2b8', '#0079CC', '#CD853F', '#6f42c1', '#20c997', '#fd7e14'];

  tableOptions: TableOptions = {
    columns: [
      {
        prop: 'Name'
      },
      {
        prop: 'OrderAmount'
      },
      {
        prop: 'CreatedDate'
      }
    ],
    filters: [new AFilter(Order, [new ACondition(Order, 'CreatedDate', 'LastXDays', 7)])]
  };

  /**
  * @ignore
  */
  constructor(private orderService: OrderService, private userService: UserService) { }

  /**
  * @ignore
  */
  ngOnInit() {

    this.user$ = this.userService.getCurrentUser();

    this.totalOrderAmount$ = this.orderService.query({
      aggregate: true
    }).pipe(map(res => get(first(res), 'SUM_OrderAmount') || '0'));

    this.recentOrders$ = this.orderService.query({
      aggregate: true,
      conditions: [new ACondition(Order, 'CreatedDate', 'LastXDays', 7)],
      groupBy: ['Status']
    });

    this.recentOrders$.pipe(
      take(1),
      tap( recentOrders => {
        this.totalRecords$ = of(
          isArray(recentOrders)
        ? sumBy(recentOrders, order => get(order, 'total_records'))
        : get(recentOrders, 'total_records')
        ),

        this.orderAmountByStatus$ = of(
          isArray(recentOrders)
          ? omit(mapValues(groupBy(recentOrders, 'Apttus_Config2__Status__c'), s => sumBy(s, 'SUM_OrderAmount')), 'null')
          : zipObject([get(recentOrders, 'Apttus_Config2__Status__c')], rmap([get(recentOrders, 'Apttus_Config2__Status__c')], key => get(recentOrders, 'SUM_OrderAmount')))
        )
      })
    ).subscribe();
  }
}
