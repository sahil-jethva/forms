import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LocalStorageService } from './localstorage.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private localService: LocalStorageService) { }
  canActivate() {
    const token = this.localService.getToken()
    if (token) {
      this.router.navigate(['/forms'])
      return false
    }
    return true
  }

}
