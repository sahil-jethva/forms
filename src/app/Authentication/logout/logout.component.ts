import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterLink } from '@angular/router';
import { LocalStorageService } from '../../services/localstorage.service';

@Component({
  selector: 'app-logout',
  imports: [SharedModule, RouterLink],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {
  constructor(private localStorage: LocalStorageService) { }
  logout() {
    this.localStorage.removeToken()
  }
}
