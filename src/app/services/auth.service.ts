import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Login } from '../common/Login';
import { Register } from '../common/Register';
const url = 'http://localhost:8989/api/auth/';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private sessionService: SessionService) { }


  login(userData: Login): Observable<any> {
    return this.http.post(url + 'signin',userData);
  }
  register(user: Register): Observable<any> {
    return this.http.post(url + 'signup',user);
  }
}
