import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Order, OrderLineItem, OrderService, ProductService, Product } from '@congacommerce/ecommerce';
import * as _ from 'lodash';
import { flatMap } from 'rxjs/operators';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  modalRef: BsModalRef;
  order: Order;
  selectedLineItem: OrderLineItem;
  /**
   * The product identifier set in the configuration file.
   */
  identifier: string = 'Id';

  /**
   * @ignore
   */
  constructor(private route: ActivatedRoute, private orderService: OrderService, private modalService: BsModalService, public productService: ProductService) { }

  /**
   * @ignore
   */
  ngOnInit() {
    this.productService.configurationService.get('productIdentifier');
    this.route.params
      .pipe(
        flatMap(r => this.orderService.getOrderByName(r.orderId))
      )
      .subscribe(order => this.order = order);
  }

  /**
   * @ignore
   */
  openModal(template: TemplateRef<any>, lineItem: OrderLineItem) {
    this.selectedLineItem = lineItem;
    this.modalRef = this.modalService.show(template, {class:'modal-lg'});
  }

}
