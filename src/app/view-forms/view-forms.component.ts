import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuestionType } from '../modals/modal';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { APIURL } from '../env';
import { CommonService } from '../services/commonService';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

@Component({
  selector: 'app-view-forms',
  imports: [SharedModule, RouterLink, FormsModule, ReactiveFormsModule, CommonModule, DragDropModule],
  templateUrl: './view-forms.component.html',
  styleUrl: './view-forms.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class ViewFormsComponent implements OnInit {

  value: number = 0;
  options: QuestionType[] | undefined
  selectedQuestionIndex: number | null = null;
  selectedOptionIndex: number | null = null;
  isOption: boolean = false;
  recognition: any;
  u_id!: number
  constructor(private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private httpclient: HttpClient,
    private commonService: CommonService,
    private fb: FormBuilder,
    private router: Router
  ) { }
  forms!: FormGroup
  ngOnInit() {
    this.forms = this.fb.group({
      form_name: [''],
      questions: this.fb.array([])
    });
    this.addQuestion();

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = "en-US";
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };
    this.commonService.getQuestionType().subscribe(
      (res) => {
        this.options = res
      }
    )
    this.commonService.getMe().subscribe(
      (res) => {
        this.u_id = res.user.id
      }
    )
  }
  activeField: { type: 'question_name' | 'op_1', qindex: number, oindex?: number } | null = null;

  setActiveField(type: 'question_name' | 'op_1', qindex: number, oindex?: number) {
    this.activeField = { type, qindex, oindex };
    console.log("Active Field:", this.activeField);
    this.startSpeechRecognition()
  }

  get questionsArray(): FormArray {
    return this.forms.get('questions') as FormArray;
  }
  getOptionsArray(qindex: number): FormArray {
    return this.questionsArray.at(qindex).get('options') as FormArray;
  }

  startSpeechRecognition() {
    if (!this.recognition) return;

    // Check if recognition is running before starting
    try {
      this.recognition.start();
    } catch (error) {
      console.warn("Speech recognition is already running.");
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Recognized Text:", transcript);

      if (this.activeField) {
        if (this.activeField.type === 'question_name') {
          this.questionsArray.at(this.activeField.qindex).patchValue({ question_name: transcript });
        } else if (this.activeField.type === 'op_1' && this.activeField.oindex !== undefined) {
          this.getOptionsArray(this.activeField.qindex).at(this.activeField.oindex).patchValue({ op_1: transcript });
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };
  }


  addOption(qindex: number) {
    const optionsArray = this.questionsArray.at(qindex).get('options') as FormArray;
    optionsArray.push(this.createOption());
  }

  removeQuestion(qindex: number) {
    this.questionsArray.removeAt(qindex);
  }
  removeOption(qindex: number, oIndex: number) {
    const optionsArray = this.questionsArray.at(qindex).get('options') as FormArray;
    optionsArray.removeAt(oIndex);
  }

  updateSelectedOption(qindex: number) {
    const selectedOption = this.questionsArray.at(qindex).get('question_type')?.value;

    if (selectedOption && typeof selectedOption === 'object') {
      this.questionsArray.at(qindex).get('question_type')?.patchValue({
        name: selectedOption.name,
        icon: selectedOption.icon
      });
    }

  }



  addQuestion() {
    const questionGroup = this.fb.group({
      question_name: [''],
      question_type: [''],
      options: this.fb.array([this.createOption()])
    });

    this.questionsArray.push(questionGroup);
  }
  createOption() {
    return this.fb.group({
      op_1: ['']
    });
  }

  createQuestionFormGroup(questionData: any): FormGroup {
    return this.fb.group({
      question_name: [questionData.question_name || ''],
      question_type: this.fb.group({
        name: [questionData.question_type?.name || ''],
        icon: [questionData.question_type?.icon || '']
      }),
      options: this.fb.array(
        (questionData.options || []).map((option: any) => this.fb.group({ op_1: [option.op_1 || ''] }))
      )
    });
  }

  confirm2(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Nobody will be notified when publishing the form',
      header: 'Publish form',
      icon: 'pi pi-bell',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Published',
        severity: 'indigo',

      },
      accept: () => {
        this.saveForm()
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Canceled', detail: 'You have canceled the form' });
      },
    });
  }

  publish: boolean = false;
  formID!: number
  published(): Promise<number> {
    return new Promise((resolve) => {
      const url = `${APIURL}/forms`
      const formValues = this.forms.value;
      const uniqueLink = crypto.randomUUID();

      const questionMap = formValues.questions.map((question: any) => ({
        question_name: question.question_name,
        question_type: typeof question.question_type === 'object' ? question.question_type.name : question.question_type,
        options: question.options.map((option: any) => ({
          option_name: option.op_1
        }))
      }));
      const requestbody = {
        createdby_id: this.u_id,
        form_name: formValues.form_name,
        link: uniqueLink,
        questions: questionMap
      }
      this.httpclient.post<{ id: number }>(url, requestbody).subscribe(
        (res) => {
          this.publish = true;
          this.formID = res.id;
          this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Your form has been published!' });
          resolve(this.formID);
        }
      )
    })
  }
  async saveForm() {
    try {
      this.formID = await this.published();
      sessionStorage.setItem('StoredID', JSON.stringify(this.formID))
    } catch (error) {
      console.error("Failed to get form ID:", error);
    }
  }

  navigateToRespoder() {
    this.router.navigate(['respond-form']);
  }
}
