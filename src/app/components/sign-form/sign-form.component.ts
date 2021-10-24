import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Login } from 'src/app/common/Login';
import { LoginService } from 'src/app/services/login.service';
import { SessionService } from 'src/app/services/session.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { Register } from '../../common/Register';
import { SendmailService } from '../../services/sendmail.service';

@Component({
  selector: 'app-sign-form',
  templateUrl: './sign-form.component.html',
  styleUrls: ['./sign-form.component.css']
})
export class SignFormComponent implements OnInit {

  login!: Login;
  register !: Register;
  show: boolean = false;
  loginForm: FormGroup;
  registerForm!: FormGroup;
  isLoggedIn = false;
  isLoginFailed = false;
  roles: string[] = [];
  otpcode!: any;

  constructor(private sendMailService : SendmailService, private sessionService: SessionService,private toastr: ToastrService, private router: Router,private tokenStorage: TokenStorageService, private authService: AuthService) {
    this.loginForm = new FormGroup({
      'email': new FormControl(null),
      'password': new FormControl(null)
    });

    this.registerForm = new FormGroup({

      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, Validators.minLength(6)]),
      'name': new FormControl(null, [Validators.required, Validators.minLength(6)]),
      'status': new FormControl(true),
      'gender': new FormControl(true),
      'image': new FormControl('https://res.cloudinary.com/veggie-shop/image/upload/v1633795994/users/mnoryxp056ohm0b4gcrj.png'),
      'address': new FormControl(null, [Validators.required]),
      'phone': new FormControl(null, [Validators.required, Validators.minLength(10), Validators.pattern('(0)[0-9]{9}')]),
      'registerDate': new FormControl(new Date()),
      'role' :  new FormControl(["USER"]),
      'otp': new FormControl(null, [Validators.required,Validators.minLength(6)])
    });
  }

  ngOnInit(): void {
    this.checkLogin();
  }

  sign_up() {
    this.otpcode = localStorage.getItem("otp");

    if(this.registerForm.value.otp == this.otpcode && this.registerForm.value.otp!= null){
      this.register = this.registerForm.value;
      this.authService.register( this.register).subscribe(data => {
        this.toastr.success('Đăng Kí Thành Công ', 'Hệ thống');
      },error =>{
        this.toastr.error(error.message, 'Hệ thống');
      });
    }
    else{
      this.toastr.error('lỗi', 'Hệ thống');
    }

  }

  sign_in(){
    this.login = this.loginForm.value;
    this.authService.login(this.login).subscribe(
      data => {

        this.tokenStorage.saveToken(data.token);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;

        this.toastr.success('Đăng Nhập Thành Công', 'Hệ thống');

        this.router.navigate(['/home']);

        setTimeout(() => {
          window.location.href = ('/');
        },
        500);
      },
      error => {
        this.toastr.error('Sai Thông Tin Đăng Nhập', 'Hệ thống');
        this.isLoginFailed = true;
      }
    );
  }

  sendOtp() {

    this.sendMailService.sendMailOtp(this.registerForm.value.email).subscribe(data => {
      window.localStorage.removeItem("otp");
      window.localStorage.setItem("otp", JSON.stringify(data));

      this.toastr.success('Chúng tôi đã gửi mã OTP về email của bạn !', 'Hệ thống');
    }, error => {
      if (error.status == 404) {
        this.toastr.error('Email này đã tồn tại trên hệ thống !', 'Hệ thống');
      } else {
        this.toastr.warning('Hãy nhập đúng email !', 'Hệ thống');
      }
    });

  }

  checkLogin() {
    if (this.sessionService.getUser() != null) {
      this.router.navigate(['/home']);
      window.location.href = ('/');
    }
  }

  toggle() {
    this.show = !this.show;
  }
  sendError() {
    this.toastr.warning('Hãy nhập đúng email !', 'Hệ thống');
  }
}
