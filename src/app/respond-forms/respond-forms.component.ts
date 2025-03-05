import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { APIURL } from '../env';
import { SharedModule } from '../shared/shared.module';
import { Forms, Question } from '../modals/modal';
import { CommonService } from '../services/commonService';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-respond-forms',
  imports: [SharedModule, ReactiveFormsModule, FormsModule],
  templateUrl: './respond-forms.component.html',
  styleUrl: './respond-forms.component.scss',
  providers: [ MessageService]
})
export class RespondFormsComponent implements OnInit {

  formId: string | null = null;
  formName!: string
  emailID!: string
  questions: Question[] = []
  responseForm!: FormGroup
  constructor(private httpclient: HttpClient, private service: CommonService, private fb: FormBuilder,
    private messageService: MessageService,
  ) {
    this.formId = sessionStorage.getItem('StoredID')
  }
  ngOnInit() {
    this.responseForm = this.fb.group({
      SelectChoice: [''],
      selectCheckbox: [''],
      selectedDropdown: [''],
      shortAnswer: [''],
      longAnswer: ['']
    })
    this.getFormDetail()
    this.getMe();
  }

  getMe() {
    this.service.getMe().subscribe(
      (res) => {
        this.emailID = res.user.email
      }
    )
  }
  getFormDetail() {
    const url = `${APIURL}/forms/${this.formId}`
    console.log(url);
    this.httpclient.get<Forms>(url).subscribe(
      (res) => {
        console.log(res);
        this.formName = res.form_name
        this.questions = res.questions
      }
    )
  }

  submitResponse() {
    console.log(this.formId);
    const url = `${APIURL}/responses`
    const requestbody = {
      form_id: Number(this.formId),
      responses: this.questions.map(q => ({
        q_id: q.q_id,
        question_name: q.question_name,
        selected_options:
          q.question_type === 'Short answer' ? this.responseForm.value.shortAnswer :
            q.question_type === 'Long answer' ? this.responseForm.value.longAnswer :
              q.question_type === 'Multiple choice' ? this.responseForm.value.SelectChoice :
                q.question_type === 'Checkbox' ? this.responseForm.value.selectCheckbox || [] :
                  q.question_type === 'Dropdown' ? this.responseForm.value.selectedDropdown :
                    null
      }))
    };
    this.httpclient.post(url, requestbody).subscribe(
      (res) => {
        console.log(res);
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Your response saved successfully!' });
        this.responseForm.reset();
      }
    )
  }
  clearResponse() {
    this.responseForm.reset();
  }
}
