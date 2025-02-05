import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { APIURL } from '../../env';
import { MessageService } from 'primeng/api';
import { Login } from '../../modals/modal';
import { LocalStorageService } from '../../services/localstorage.service';

@Component({
  selector: 'app-login',
  imports: [SharedModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent implements OnInit {

  loginform!: FormGroup
  constructor(private http: HttpClient, private fb: FormBuilder,
    private messageService: MessageService,
    private localService: LocalStorageService,
    private router: Router
  ) { }
  ngOnInit() {
    this.loginform = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  login() {
    const url = `${APIURL}/login`
    this.http.post<Login>(url, this.loginform.value).subscribe(
      (res: Login) => {
        this.localService.setToken(res.token)
        this.messageService.add({
          severity: 'success', summary: 'Success',
          detail: 'Login successfull!', life: 3000
        })
        this.router.navigate(['/forms']);
      }, (error) => {
        if (error.status === 401) {
          this.messageService.add({
            severity: 'error', summary: 'Error',
            detail: 'Unauthorized! Please check your email or password', life: 3000
          })
          this.loginform.reset()
        }
      }
    )
  }
}
