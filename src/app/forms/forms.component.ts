import { Component } from '@angular/core';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forms',
  imports: [NavbarComponent,RouterLink],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss'
})
export class FormsComponent {

}
