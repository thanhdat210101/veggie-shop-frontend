import { Injectable } from '@angular/core';
import { Login } from '../common/Login';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  getu //   return JSON.parse(this.data);
    () {
    throw new Error('Method not implemented.');
  }

  login!:Login;
  data!:any;

  constructor() { }

  // saveSession(email: string) {
  //   window.localStorage.removeItem("user");
  //   window.localStorage.setItem("user", JSON.stringify(email));
  // }

  // getSession() {
  //   this.data = localStorage.getItem("user");
  //   return JSON.parse(this.data);
  // }

  // deleteSession() {
  //   window.localStorage.removeItem("user");
  // }

  signOut(): void {
    window.sessionStorage.clear();
  }

  public saveToken(token: string) {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(){
    return sessionStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const userJson: string | any = sessionStorage.getItem(USER_KEY);
    return JSON.parse(userJson).email;
  }
}
