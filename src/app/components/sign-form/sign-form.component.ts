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
        this.toastr.success('????ng K?? Th??nh C??ng ', 'H??? th???ng');
      },error =>{
        this.toastr.error(error.message, 'H??? th???ng');
      });
    }
    else{
      this.toastr.error('l???i', 'H??? th???ng');
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

        this.toastr.success('????ng Nh???p Th??nh C??ng', 'H??? th???ng');

        this.router.navigate(['/home']);

        setTimeout(() => {
          window.location.href = ('/');
        },
        500);
      },
      error => {
        this.toastr.error('Sai Th??ng Tin ????ng Nh???p', 'H??? th???ng');
        this.isLoginFailed = true;
      }
    );
  }

  sendOtp() {

    this.sendMailService.sendMailOtp(this.registerForm.value.email).subscribe(data => {
      window.localStorage.removeItem("otp");
      window.localStorage.setItem("otp", JSON.stringify(data));

      this.toastr.success('Ch??ng t??i ???? g???i m?? OTP v??? email c???a b???n !', 'H??? th???ng');
    }, error => {
      if (error.status == 404) {
        this.toastr.error('Email n??y ???? t???n t???i tr??n h??? th???ng !', 'H??? th???ng');
      } else {
        this.toastr.warning('H??y nh???p ????ng email !', 'H??? th???ng');
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
    this.toastr.warning('H??y nh???p ????ng email !', 'H??? th???ng');
  }
}
