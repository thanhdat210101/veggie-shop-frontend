import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { SessionService } from 'src/app/services/session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];

  discount!: number;
  amount!: number;
  amountReal!: number;

  postForm: FormGroup;

  constructor(private cartService: CartService, private toastr: ToastrService, private router: Router, private sessionService: SessionService, private orderService: OrderService) {
    this.postForm = new FormGroup({
      'address': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'phone': new FormControl(null, [Validators.required, Validators.pattern('(0)[0-9]{9}')])
    })
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.discount = 0;
    this.amount = 0;
    this.amountReal = 0;
    this.getAllItem();
  }

  getAllItem() {
    let email = this.sessionService.getUser();
    this.cartService.getCart(email).subscribe(data => {
      this.cart = data as Cart;
      this.postForm = new FormGroup({
        'address': new FormControl(this.cart.address, [Validators.required, Validators.minLength(3)]),
        'phone': new FormControl(this.cart.phone, [Validators.required, Validators.pattern('(0)[0-9]{9}')])
      })
      this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
        this.cartDetails = data as CartDetail[];
        this.cartService.setLength(this.cartDetails.length);
        if (this.cartDetails.length == 0) {
          this.router.navigate(['/']);
          this.toastr.info('Hãy chọn một vài sản phẩm rồi tiến hành thanh toán', 'Hệ thống');
        }
        this.cartDetails.forEach(item => {
          this.amountReal += item.product.price * item.quantity;
          this.amount += item.price;
        })
        this.discount = this.amount - this.amountReal;
      })
    },error=>{
      Swal.fire(
        'Hệ Thống',
        error.message,
        'error'
      )
    })
  }

  checkOut() {
    if (this.postForm.valid) {
      Swal.fire({
        title: 'Bạn có muốn đặt đơn hàng này?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Không',
        confirmButtonText: 'Đặt'
      }).then((result) => {
        let email = this.sessionService.getUser();
        this.cartService.getCart(email).subscribe(data => {
          this.cart = data as Cart;
          this.cart.address = this.postForm.value.address;
          this.cart.phone = this.postForm.value.phone;
          this.cartService.updateCart(email, this.cart).subscribe(data => {
            this.cart = data as Cart;
            this.orderService.post(email, this.cart).subscribe(data => {
              Swal.fire(
                'Thành công!',
                'Chúc mừng bạn đã đặt hàng thành công.',
                'success'
              )
              this.router.navigate(['/cart']);
            }, error => {
              this.toastr.error('Lỗi server check out 1'+error.message, 'Hệ thống');
            })
          }, error => {
            this.toastr.error('Lỗi server check out 2', 'Hệ thống');
          })
        }, error => {
          this.toastr.error('Lỗi server check out 3', 'Hệ thống');
        })
      })
    } else {
      this.toastr.error('Hãy nhập đầy đủ thông tin', 'Hệ thống');
    }
  }

}
