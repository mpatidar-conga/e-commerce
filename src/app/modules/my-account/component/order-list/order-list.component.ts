import { Component, OnInit } from '@angular/core';

import { take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { clone, assign, get, isArray, groupBy, sumBy, omit, zipObject, mapValues, map } from 'lodash';

import { Operator, AFilter } from '@congacommerce/core';
import { OrderService, Order } from '@congacommerce/ecommerce';
import { TableOptions, FilterOptions } from '@congacommerce/elements';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  type = Order;

  totalRecords$: Observable<number>;
  totalAmount$: Observable<number>;
  ordersByStatus$: Observable<number>;
  orderAmountByStatus$: Observable<number>;

  colorPalette = ['#D22233', '#F2A515', '#6610f2', '#008000', '#17a2b8', '#0079CC', '#CD853F', '#6f42c1', '#20c997', '#fd7e14'];
  tableOptions: TableOptions = {
    columns: [
      {
        prop: 'Name'
      },
      {
        prop: 'Description',
        label: 'Title'
      },
      {
        prop: 'Status'
      },
      {
        prop: 'PriceListId'
      },
      {
        prop: 'BillToAccountId'
      },
      {
        prop: 'ShipToAccountId'
      },
      {
        prop: 'OrderAmount'
      },
      {
        prop: 'CreatedDate'
      },
      {
        prop: 'ActivatedDate'
      }
    ],
    fields: [
      'Id',
      'Name',
      'Description',
      'Status',
      'BillToAccount.Name',
      'ShipToAccount.Name',
      'PriceList.Name',
      'OrderAmount',
      'CreatedDate',
      'ActivatedDate'
    ]
  };

  filterList: Array<AFilter> = [];

  filterOptions: FilterOptions = {
    visibleFields: [
      'BillToAccountId',
      'Status',
      'OrderAmount',
      'CreatedDate'
    ],
    visibleOperators: [
      Operator.EQUAL,
      Operator.LESS_THAN,
      Operator.GREATER_THAN,
      Operator.GREATER_EQUAL,
      Operator.LESS_EQUAL,
      Operator.IN
    ]
  };
  /**
   * @ignore
   */
  constructor(private orderService: OrderService) {}

  /**
   * @ignore
   */
  ngOnInit() {
    this.loadViewData();
  }

  private loadViewData() {
    this.orderService.query({
      aggregate: true,
      groupBy: ['Status'],
      filters: this.filterList
    })
      .pipe(take(1))
      .subscribe(data => {
        this.tableOptions = clone(assign(this.tableOptions, { filters: this.filterList }));
        this.totalRecords$ = of(get(data, 'total_records', sumBy(data, 'total_records')));
        this.totalAmount$ = of(get(data, 'SUM_OrderAmount', sumBy(data, 'SUM_OrderAmount')));
        this.ordersByStatus$ = of(
          isArray(data)
            ? omit(mapValues(groupBy(data, 'Apttus_Config2__Status__c'), s => sumBy(s, 'total_records')), 'null')
            : zipObject([get(data, 'Apttus_Config2__Status__c')], map([get(data, 'Apttus_Config2__Status__c')], key => get(data, 'total_records')))
        );
        this.orderAmountByStatus$ = of(
          isArray(data)
            ? omit(mapValues(groupBy(data, 'Apttus_Config2__Status__c'), s => sumBy(s, 'SUM_OrderAmount')), 'null')
            : zipObject([get(data, 'Apttus_Config2__Status__c')], map([get(data, 'Apttus_Config2__Status__c')], key => get(data, 'SUM_OrderAmount')))
        );
      })
  }

  handleFilterListChange(event: any) {
    this.filterList = event;
    this.loadViewData();
  }

}