import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Lightbox } from 'ngx-lightbox';
import { ToastrService } from 'ngx-toastr';
import { Customer } from 'src/app/common/Customer';
import { Order } from 'src/app/common/Order';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { SessionService } from 'src/app/services/session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  customer!: Customer;
  orders!: Order[];

  page: number = 1;

  done!: number;

  constructor(private customerService: CustomerService, private toastr: ToastrService, private sessionService: SessionService, private router: Router, private orderService: OrderService) {

  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.getCustomer();
    this.getOrder();
  }

  getCustomer() {
    let email = this.sessionService.getUser();
    this.customerService.getByEmail(email).subscribe(data => {
      this.customer = data as Customer;
    }, error => {
      this.toastr.error('Lỗi thông tin', 'Hệ thống')
      window.location.href = ('/');
    })
  }

  getOrder() {
    let email = this.sessionService.getUser();
    this.orderService.get(email).subscribe(data => {
      this.orders = data as Order[];
      this.done = 0;
      this.orders.forEach(o => {
        if (o.status === 2) {
          this.done += 1
        }
      })
    }, error => {
      this.toastr.error('Lỗi server profile 1', 'Hệ thống');
    })
  }

  cancel(id: number) {
    if(id===-1) {
      return;
    }
    Swal.fire({
      title: 'Bạn có muốn huỷ đơn hàng này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Không',
      confirmButtonText: 'Huỷ'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.cancel(id).subscribe(data => {
          this.getOrder();
          this.toastr.success('Huỷ đơn hàng thành công!', 'Hệ thống');
        }, error => {
          this.toastr.error('Lỗi server profile 2', 'Hệ thống');
        })
      }
    })

  }

  finish() {
    this.ngOnInit();
  }
}
