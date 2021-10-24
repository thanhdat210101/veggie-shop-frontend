import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '../common/Login';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  url = "http://localhost:8989/api/auth/user";

  constructor(private httpClient: HttpClient) { }


  // isLogin() {
  //   return this.sessionService.getSession() != null;
  // }
  login(login: Login) {
    return this.httpClient.post(this.url+'/login', login);
  }

  logout() {
    return this.httpClient.get(this.url+'/logout');
  }
}
