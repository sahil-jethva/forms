import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { Router, RouterLink } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { APIURL } from '../env';
import { Forms } from '../modals/modal';
import { CommonService } from '../services/commonService';

@Component({
  selector: 'app-forms',
  imports: [NavbarComponent, RouterLink, SharedModule],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss'
})
export class FormsComponent implements OnInit {

  allForms!: Forms[]
  createdID!: number

  constructor(private http: HttpClient, private router: Router, private commonService: CommonService) { }

  ngOnInit() {
    this.commonService.getMe().subscribe(
      (res) => {
        this.createdID = res.user.id
        this.getForms()
      }
    )
  }
  getForms() {
    const url = `${APIURL}/forms/created-by/${this.createdID}`
    this.http.get<Forms[]>(url).subscribe(
      (data) => {
        this.allForms = data
      }
    )
  }
  clearStoredID() {
    // sessionStorage.removeItem('StoredID');
    this.router.navigate(['/form-edit', 'new']);
  }

}
