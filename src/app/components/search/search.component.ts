import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Customer } from 'src/app/common/Customer';
import { Favorites } from 'src/app/common/Favorites';
import { Product } from 'src/app/common/Product';
import { CartService } from 'src/app/services/cart.service';
import { CustomerService } from 'src/app/services/customer.service';
import { FavoritesService } from 'src/app/services/favorites.service';
import { ProductService } from 'src/app/services/product.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  products!: Product[];
  isLoading = true;
  customer!: Customer;
  favorite!: Favorites;
  favorites!: Favorites[];

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];

  page: number = 1;

  key: string = '';
  keyF: string = '';
  reverse: boolean = true;

  keyword!: string;

  constructor(private productService: ProductService, private cartService: CartService, private route: ActivatedRoute, private customerService: CustomerService, private toastr: ToastrService, private favoriteService: FavoritesService, private sessionService: SessionService, private router: Router) {
    route.params.subscribe(val => {
      this.ngOnInit();
    })
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.keyword = this.route.snapshot.params['keyword'];

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.getProducts();
  }

  getProducts() {
    this.productService.getAll().subscribe(data => {
      this.isLoading = false;
      this.products = data as Product[];
      this.products = this.products.filter(p => p.name.toLowerCase().includes(this.keyword.toLowerCase()) || p.price*(1 - p.discount/100) == Number(this.keyword));
    }, error => {
      this.toastr.error('Lỗi server!', 'Hệ thống');
    })
  }

  toggleLike(id: number) {
    let email = this.sessionService.getUser();
    if (email == null) {
      this.router.navigate(['/sign-form']);
      this.toastr.info('Hãy đăng nhập để sử dụng dịch vụ của chúng tôi', 'Hệ thống');
      return;
    }
    this.favoriteService.getByProductIdAndEmail(id, email).subscribe(data => {
      if (data == null) {
        this.customerService.getByEmail(email).subscribe(data => {
          this.customer = data as Customer;
          this.favoriteService.post(new Favorites(0, new Customer(this.customer.userId), new Product(id))).subscribe(data => {
            this.toastr.success('Thêm thành công!', 'Hệ thống');
            this.favoriteService.getByEmail(email).subscribe(data => {
              this.favorites = data as Favorites[];
              this.favoriteService.setLength(this.favorites.length);
            }, error => {
              this.toastr.error('Lỗi truy xuất dữ liệu! search 1', 'Hệ thống');
            })
          }, error => {
            this.toastr.error('Thêm thất bại!', 'Hệ thống');
          })
        })
      } else {
        this.favorite = data as Favorites;
        this.favoriteService.delete(this.favorite.favoriteId).subscribe(data => {
          this.toastr.info('Đã xoá ra khỏi danh sách yêu thích!', 'Hệ thống');
          this.favoriteService.getByEmail(email).subscribe(data => {
            this.favorites = data as Favorites[];
            this.favoriteService.setLength(this.favorites.length);
          }, error => {
            this.toastr.error('Lỗi truy xuất dữ liệu! search 2', 'Hệ thống');
          })
        }, error => {
          this.toastr.error('Lỗi!', 'Hệ thống');
        })
      }
    })
  }

  sort(keyF: string) {
    if (keyF === 'enteredDate') {
      this.key = 'enteredDate';
      this.reverse = true;
    } else
      if (keyF === 'priceDesc') {
        this.key = '';
        this.products.sort((a, b) => b.price - a.price);
      } else
        if (keyF === 'priceAsc') {
          this.key = '';
          this.products.sort((a, b) => a.price - b.price);
        }
        else {
          this.key = '';
          this.getProducts();
        }
  }

  addCart(productId: number, price: number) {
    let email = this.sessionService.getUser();
    if (email == null) {
      this.router.navigate(['/sign-form']);
      this.toastr.info('Hãy đăng nhập để sử dụng dịch vụ của chúng tôi', 'Hệ thống');
      return;
    }
    this.cartService.getCart(email).subscribe(data => {
      this.cart = data as Cart;
      this.cartDetail = new CartDetail(0, 1, price, new Product(productId), new Cart(this.cart.cartId));
      this.cartService.postDetail(this.cartDetail).subscribe(data => {
        this.toastr.success('Thêm vào giỏ hàng thành công!', 'Hệ thống!');
        this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
          this.cartDetails = data as CartDetail[];
          this.cartService.setLength(this.cartDetails.length);
        })
      }, error => {
        this.toastr.error('Sản phẩm này có thể đã hết hàng!', 'Hệ thống');
        this.router.navigate(['/home']);
        window.location.href = "/";
      })
    })
  }

}
