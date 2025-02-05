import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { APIURL } from '../../env';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [SharedModule, ReactiveFormsModule,RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [MessageService]
})
export class RegisterComponent implements OnInit {
  Registation!: FormGroup
  constructor(private httpclient: HttpClient, private fb: FormBuilder, private messageService: MessageService) { }
  ngOnInit() {
    this.Registation = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }
  register() {
    const url = `${APIURL}/register`
    this.httpclient.post(url, this.Registation.value).subscribe(
      (res) => {
        console.log(res);
        this.Registation.reset()
        this.messageService.add({
          severity: 'success', summary: 'Success',
          detail: 'Registration successfully!! Please login!', life: 3000
        })
      }
    )
  }
}
