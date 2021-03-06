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
          this.toastr.info('H??y ch???n m???t v??i s???n ph???m r???i ti???n h??nh thanh to??n', 'H??? th???ng');
        }
        this.cartDetails.forEach(item => {
          this.amountReal += item.product.price * item.quantity;
          this.amount += item.price;
        })
        this.discount = this.amount - this.amountReal;
      })
    },error=>{
      Swal.fire(
        'H??? Th???ng',
        error.message,
        'error'
      )
    })
  }

  checkOut() {
    if (this.postForm.valid) {
      Swal.fire({
        title: 'B???n c?? mu???n ?????t ????n h??ng n??y?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Kh??ng',
        confirmButtonText: '?????t'
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
                'Th??nh c??ng!',
                'Ch??c m???ng b???n ???? ?????t h??ng th??nh c??ng.',
                'success'
              )
              this.router.navigate(['/cart']);
            }, error => {
              this.toastr.error('L???i server check out 1'+error.message, 'H??? th???ng');
            })
          }, error => {
            this.toastr.error('L???i server check out 2', 'H??? th???ng');
          })
        }, error => {
          this.toastr.error('L???i server check out 3', 'H??? th???ng');
        })
      })
    } else {
      this.toastr.error('H??y nh???p ?????y ????? th??ng tin', 'H??? th???ng');
    }
  }

}
