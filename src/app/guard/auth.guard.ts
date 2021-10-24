import { Injectable } from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public token: TokenStorageService, private _router: Router){}

  canActivate() :boolean {
    if(this.token.getUser()) {
        return true;
    } else {
      this._router.navigate(['/sign-form'])
      return false;
    }
  }

}
