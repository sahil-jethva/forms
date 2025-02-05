import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { MegaMenuItem } from 'primeng/api';
import { UserLoginDetail } from '../../modals/modal';
import { APIURL } from '../../env';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-navbar',
  imports: [SharedModule,RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  items: MegaMenuItem[] | undefined;
  details: UserLoginDetail | undefined | null = null;
  constructor(
    private httpClient: HttpClient
  ) { }
  ngOnInit() {
    this.items = [
      {
        label: 'Forms',
        icon: 'pi pi-align-justify',
        root: true,
        routerLink: '/forms'
      }
    ];
    this.userLoggedInDetail()
  }
  userLoggedInDetail() {
    const url = `${APIURL}/me`
    this.httpClient.get<{ user: UserLoginDetail }>(url).subscribe(
      (res) => {
        this.details = res.user
      }
    )
  }
  gi(para: string | undefined) {
    const img = `https://avatar.iran.liara.run/public/boy?username=${para}`
    return img
  }
}
