import { Component, OnInit, OnDestroy } from '@angular/core';
import { ACondition, AFilter, AObject, Operator } from '@congacommerce/core';
import { CartService, AssetService, AssetLineItemExtended, AssetLineItem, StorefrontService, Product, Cart } from '@congacommerce/ecommerce';
import { Observable, combineLatest, of, BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { get, map, includes, filter, split, forEach, values, groupBy, isEmpty, omit, isArray, mapValues, sumBy, zipObject, concat, last } from 'lodash';
import { AssetModalService, TableOptions, TableAction, ChildRecordOptions, FilterOptions, CheckState } from '@congacommerce/elements';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { ClassType } from 'class-transformer/ClassTransformer';

@Component({
  selector: 'app-installed-products-layout',
  templateUrl: './installed-products-layout.component.html',
  styleUrls: ['./installed-products-layout.component.scss'],
  providers: [DatePipe]
})
export class InstalledProductsLayoutComponent implements OnInit, OnDestroy {

  view$: BehaviorSubject<AssetListView> = new BehaviorSubject<AssetListView>(null);

  cart: Cart;

  renewFilter: AFilter;

  priceTypeFilter: AFilter;

  assetActionFilter: AFilter;

  productFamilyFilter: AFilter;

  advancedFilters: Array<AFilter> = [];

  advancedFilterOptions: FilterOptions = {
    visibleFieldsWithOperators: [
      {
        field: 'Name',
        operators: [Operator.CONTAINS, Operator.DOES_NOT_CONTAIN, Operator.BEGINS_WITH, Operator.EQUAL, Operator.NOT_EQUAL]
      },
      {
        field: 'SellingFrequency',
        operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.IN, Operator.NOT_IN]
      },
      {
        field: 'StartDate',
        operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.GREATER_THAN, Operator.GREATER_EQUAL, Operator.LESS_THAN, Operator.LESS_EQUAL]
      },
      {
        field: 'EndDate',
        operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.GREATER_THAN, Operator.GREATER_EQUAL, Operator.LESS_THAN, Operator.LESS_EQUAL]
      },
      {
        field: 'NetPrice',
        operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.GREATER_THAN, Operator.GREATER_EQUAL, Operator.LESS_THAN, Operator.LESS_EQUAL]
      },
      {
        field: 'Quantity',
        operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.GREATER_THAN, Operator.GREATER_EQUAL, Operator.LESS_THAN, Operator.LESS_EQUAL]
      },
      {
        field: 'AssetStatus',
        operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.IN, Operator.NOT_IN]
      },
      {
        field: 'PriceType',
        operators: [Operator.EQUAL, Operator.NOT_EQUAL, Operator.IN, Operator.NOT_IN]
      },
      {
        field: 'ProductId',
        operators: [Operator.EQUAL, Operator.NOT_EQUAL]
      }
    ]
  };

  defaultFilters: Array<AFilter> = [
    new AFilter(this.assetService.type, [
      new ACondition(this.assetService.type, 'LineType', 'NotEqual', 'Option'),
      new ACondition(this.assetService.type, 'Product.ConfigurationType', 'NotEqual', 'Option'),
      new ACondition(this.assetService.type, 'IsPrimaryLine', 'Equal', true)
    ])
  ];

  preselectItemsInGroups: boolean = false;

  colorPalette = ['#D22233', '#F2A515', '#6610f2', '#008000', '#17a2b8', '#0079CC', '#CD853F', '#6f42c1', '#20c997', '#fd7e14'];

  private assetActionMap = {
    All: null,
    Renew: new AFilter(AssetLineItem, [new ACondition(AssetLineItem, 'PriceType', 'NotEqual', 'One Time')]),
    Terminate: new AFilter(AssetLineItem, [new ACondition(AssetLineItem, 'PriceType', 'NotEqual', 'One Time')]),
    'Buy More': new AFilter(this.assetService.type, [new ACondition(Product, 'Product.ConfigurationType', 'Equal', 'Standalone')]),
    'Change Configuration': new AFilter(this.assetService.type, [
      new ACondition(this.assetService.type, 'AssetStatus', 'NotEqual', 'Cancelled'),
      new ACondition(AssetLineItem, 'PriceType', 'NotEqual', 'One Time')], [
      new AFilter(this.assetService.type, [
        new ACondition(Product,
          'Product.ConfigurationType',
          'Equal',
          'Bundle'
        ),
        new ACondition(Product,
          'Product.HasAttributes',
          'Equal',
          true
        )
      ], null, 'OR')
    ])
  };

  private subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    public assetService: AssetService,
    private assetModalService: AssetModalService,
    protected cartService: CartService,
    protected toastr: ToastrService,
    private storefrontService: StorefrontService
  ) { }


  ngOnInit() {
    if (!isEmpty(get(this.route, 'snapshot.queryParams'))) {
      this.preselectItemsInGroups = true;
      this.assetActionFilter = this.assetActionMap[get(this.route, 'snapshot.queryParams.action')];
      this.advancedFilters = [new AFilter(this.assetService.type, map(split(decodeURIComponent(get(this.route, 'snapshot.queryParams.productIds')), ','), id => new ACondition(this.assetService.type, 'ProductId', 'Equal', id)), null, 'OR')];
    }
    this.loadView();
  }

  loadView() {
    this.ngOnDestroy();
    this.subscription = combineLatest(
      this.assetService.query({
        aggregate: true,
        groupBy: ['PriceType'],
        filters: this.getFilters()
      }),
      this.storefrontService.getStorefront(),
      this.cartService.getMyCart(),
    ).subscribe(([chartData, storefront, cart]) => {
      this.cart = cart;
      this.view$.next({
        tableOptions: {
          groupBy: 'Name',
          filters: this.getFilters(),
          defaultSort: {
            column: 'CreatedDate',
            direction: 'ASC'
          },
          columns: [
            { prop: 'Name' },
            { prop: 'SellingFrequency' },
            { prop: 'StartDate' },
            { prop: 'EndDate' },
            { prop: 'NetPrice' },
            { prop: 'Quantity' },
            { prop: 'AssetStatus' },
            { prop: 'PriceType' }
          ],
          lookups: [
            {
              field: 'AttributeValueId'
            },
            {
              field: 'ProductId'
            }
          ],
          actions: filter(this.getMassActions(cart), action => includes(get(storefront, 'AssetActions'), get(action, 'label'))),
          childRecordOptions: {
            filters: [new AFilter(this.assetService.type, [new ACondition(this.assetService.type, 'LineType', 'NotEqual', 'Option'), new ACondition(Product, 'Product.ConfigurationType', 'NotEqual', 'Option'), new ACondition(this.assetService.type, 'IsPrimaryLine', 'Equal', false)])],
            relationshipField: 'BundleAssetId',
            childRecordFields: ['ChargeType', 'SellingFrequency', 'StartDate', 'EndDate', 'NetPrice', 'Quantity', 'AssetStatus', 'PriceType']
          } as ChildRecordOptions,
          selectItemsInGroupFunc: this.preselectItemsInGroups ? (recordData => {
            forEach(values(groupBy(recordData, 'Product.Name')), v => {
              const recentAsset = last(filter(v, x => !isEmpty(x.get('actions'))));
              if (recentAsset) recentAsset.set('state', CheckState.CHECKED);
            });
          }) : null,
          disableLink: true
        } as TableOptions,
        assetType: AssetLineItemExtended,
        colorPalette: this.colorPalette,
        barChartData: isArray(chartData)
          ? omit(mapValues(groupBy(chartData, 'Apttus_Config2__PriceType__c'), s => sumBy(s, 'total_records')), 'null')
          : zipObject([get(chartData, 'Apttus_Config2__PriceType__c')], map([get(chartData, 'Apttus_Config2__PriceType__c')], key => get(chartData, 'total_records'))),
        doughnutChartData: isArray(chartData)
          ? omit(mapValues(groupBy(chartData, 'Apttus_Config2__PriceType__c'), s => sumBy(s, 'SUM_NetPrice')), 'null')
          : zipObject([get(chartData, 'Apttus_Config2__PriceType__c')], map([get(chartData, 'Apttus_Config2__PriceType__c')], key => get(chartData, 'SUM_NetPrice'))),
        assetActionValue: !isEmpty(get(this.route, 'snapshot.queryParams')) ? decodeURIComponent(get(this.route, 'snapshot.queryParams.action')) : 'All',
        advancedFilterList: this.advancedFilters
      } as AssetListView);
      this.preselectItemsInGroups = false;
    });
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  handleAdvancedFilterChange(event: any) {
    this.advancedFilters = event;
    this.loadView();
  }

  onRenewalChange(event: AFilter) {
    this.renewFilter = event;
    this.loadView();
  }

  onPriceTypeChange(event: AFilter) {
    this.priceTypeFilter = event;
    this.loadView();
  }

  onAssetActionChange(event: string) {
    this.assetActionFilter = this.assetActionMap[event];
    this.loadView();
  }

  onProductFamilyChange(event: AFilter) {
    this.productFamilyFilter = event;
    this.loadView();
  }

  private getFilters() {
    return concat(this.defaultFilters, this.advancedFilters, this.renewFilter, this.priceTypeFilter, this.assetActionFilter, this.productFamilyFilter);
  }

  private getMassActions(cart: Cart): Array<TableAction> {
    return [
      {
        icon: 'fa-sync',
        massAction: true,
        label: 'Renew',
        theme: 'primary',
        validate(record: AssetLineItemExtended, childRecords: Array<AssetLineItemExtended>): boolean {
          return record.canRenew(childRecords) && !(filter(get(cart, 'LineItems'), (item) => get(item, 'AssetLineItemId') === record.Id).length > 0);
        },
        action: (recordList: Array<AObject>): Observable<void> => {
          this.assetModalService.openRenewModal(
            <AssetLineItem>recordList[0],
            <Array<AssetLineItem>>recordList
          );
          return of(null);
        }
      },
      {
        icon: 'fa-ban',
        massAction: true,
        label: 'Terminate',
        theme: 'danger',
        validate(record: AssetLineItemExtended, childRecords: Array<AssetLineItemExtended>): boolean {
          return record.canTerminate(childRecords) && !(filter(get(cart, 'LineItems'), (item) => get(item, 'AssetLineItemId') === record.Id).length > 0);
        },
        action: (recordList: Array<AObject>): Observable<void> => {
          this.assetModalService.openTerminateModal(
            <AssetLineItem>recordList[0],
            <Array<AssetLineItem>>recordList
          );
          return of(null);
        }
      },
      {
        icon: 'fa-dollar-sign',
        massAction: false,
        label: 'Buy More',
        theme: 'primary',
        validate(record: AssetLineItemExtended, childRecords: Array<AssetLineItemExtended>): boolean {
          return record.canBuyMore() && !(filter(get(cart, 'LineItems'), (item) => get(item, 'AssetLineItemId') === record.Id).length > 0);
        },
        action: (recordList: Array<AObject>): Observable<void> => {
          this.assetModalService.openBuyMoreModal(
            <AssetLineItem>recordList[0],
            <Array<AssetLineItem>>recordList
          );
          return of(null);
        }
      },
      {
        icon: 'fa-wrench',
        label: 'Change Configuration',
        theme: 'primary',
        validate(record: AssetLineItemExtended, childRecords: Array<AssetLineItemExtended>): boolean {
          return record.canChangeConfiguration() && !(filter(get(cart, 'LineItems'), (item) => get(item, 'AssetLineItemId') === record.Id).length > 0);
        },
        action: (recordList: Array<AObject>): Observable<void> => {
          this.assetModalService.openChangeConfigurationModal(
            <AssetLineItem>recordList[0],
            <Array<AssetLineItem>>recordList
          );
          return of(null);
        }
      }
    ];
  }
}

interface AssetListView {
  tableOptions: TableOptions;
  assetType: ClassType<AObject>;
  colorPalette: Array<string>;
  barChartData: Object;
  doughnutChartData: Object;
  assetActionValue?: string;
  advancedFilterList?: Array<AFilter>;
}

