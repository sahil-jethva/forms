import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LocalStorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class ProtectedAuthGuardService implements CanActivate {

  constructor(private router: Router, private localService: LocalStorageService) { }

  canActivate() {
    const token = this.localService.getToken()
    // const token = localStorage.getItem(StorageKeys.TOKEN)

    if (!token) {
      this.router.navigate(['/'])
      return false
    }
    return true
  }

}
