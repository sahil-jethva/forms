import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { APIURL } from '../../env';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  imports: [SharedModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent implements OnInit {

  loginform!: FormGroup
  constructor(private http: HttpClient, private fb: FormBuilder, private messageService: MessageService) { }
  ngOnInit() {
    this.loginform = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  login() {
    const url = `${APIURL}/login`
    this.http.post(url, this.loginform.value).subscribe(
      (res) => {
        this.messageService.add({
          severity: 'success', summary: 'Success',
          detail: 'Login successful', life: 3000
        })
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
