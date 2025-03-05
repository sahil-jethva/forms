import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { RouterLink } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { APIURL } from '../env';
import { Forms } from '../modals/modal';

@Component({
  selector: 'app-forms',
  imports: [NavbarComponent, RouterLink, SharedModule],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss'
})
export class FormsComponent implements OnInit {

  allForms!: Forms[]

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getForms()
  }
  getForms() {
    const url = `${APIURL}/forms`
    this.http.get<Forms[]>(url).subscribe(
      (data) => {
        console.log(data);
        this.allForms = data
      }
    )
  }
}
