import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Category } from 'src/app/common/Category';
import { Customer } from 'src/app/common/Customer';
import { Favorites } from 'src/app/common/Favorites';
import { CartService } from 'src/app/services/cart.service';
import { CategoryService } from 'src/app/services/category.service';
import { CustomerService } from 'src/app/services/customer.service';
import { FavoritesService } from 'src/app/services/favorites.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isLogin:boolean=false;
  categories!: Category[];
  favorites!: Favorites[];
  cartDetails!: CartDetail[];
  cart!:Cart;

  totalFavoriteItem!:number;
  totalCartItem!:number;
  keyword:string = ' ';

  constructor(private categoryService: CategoryService, private cartService: CartService, private toastr: ToastrService, private sessionService: SessionService, private customerService: CustomerService, private router: Router, private favoriteService: FavoritesService) { }

  ngOnInit(): void {
    this.favoriteService.$data.subscribe(data=>{
      this.totalFavoriteItem = data;
    })
    this.cartService.$data.subscribe(data=>{
      this.totalCartItem = data;
    })
    this.getAllFavorites();
    this.getAllCartItem();
    this.getCategories();
    this.checkLogin();
  }

  search(event: any) {
    this.keyword = (event.target as HTMLInputElement).value;
  }

  getAllFavorites() {
    let email = this.sessionService.getUser();
    console.log(email);

    if(email==null) {
      return;
    }
    this.favoriteService.getByEmail(email).subscribe(data=>{
      this.favorites = data as Favorites[];
      this.favoriteService.setLength(this.favorites.length);
    }, error=>{
      this.toastr.error('L???i truy xu???t d??? li???u! header 1', 'H??? th???ng');
    })
  }

  getAllCartItem() {
    //cai nay la lay email.... nhung may lay cai token vao nen no truy van sai
    //n??y call t n??i r???i, x??? l?? c??i getUser l?? tr??? v??? c??i
    let email = this.sessionService.getUser();
    if(email==null) {
      return;
    }
    this.cartService.getCart(email).subscribe(data=>{
      this.cart = data as Cart;
      this.cartService.getAllDetail(this.cart.cartId).subscribe(data=>{
        this.cartDetails = data as CartDetail[];
        this.cartService.setLength(this.cartDetails.length);
      }, error=>{
        this.toastr.error('L???i server header 2', 'H??? th???ng');
      })
    }, error =>{
      this.toastr.error('L???i server header 3', 'H??? th???ng');
    })
  }

  checkLogin() {
    let email = this.sessionService.getUser();
    this.customerService.getByEmail(email).subscribe(data=>{
      this.isLogin = true;
    }, error=>{
      this.sessionService.signOut();
      this.router.navigate(['home']);
    })
  }

  getCategories() {
    this.categoryService.getAll().subscribe(data=>{
      this.categories = data as Category[];
    })
  }

  logout() {
    this.sessionService.signOut();
    window.location.href = ('/');
  }

}
