import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RouterLink } from '@angular/router';
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
  imports: [SharedModule, RouterLink, FormsModule, ReactiveFormsModule,CommonModule, DragDropModule],
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
  recognition:  any;
  constructor(private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private httpclient: HttpClient,
    private commonService: CommonService,
    private fb: FormBuilder
  ) { }
  forms!:FormGroup
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

    // Handle speech result event
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Recognized Text:", transcript);

      if (this.isOption && this.selectedQuestionIndex !== null && this.selectedOptionIndex !== null) {
        this.getOptionsArray(this.selectedQuestionIndex)
          .at(this.selectedOptionIndex)
          .get('op_1')
          ?.setValue(transcript);
      } else if (this.selectedQuestionIndex !== null) {
        this.questionsArray
          .at(this.selectedQuestionIndex)
          .get('question_name')
          ?.setValue(transcript);
      }

      this.isOption = false;
      this.selectedQuestionIndex = null;
      this.selectedOptionIndex = null;
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };
    this.commonService.getQuestionType().subscribe(
      (res) => {
        this.options = res
      }
    )
  }
  get questionsArray(): FormArray {
    return this.forms.get('questions') as FormArray;
  }
  getOptionsArray(qIndex: number): FormArray {
    return this.questionsArray.at(qIndex).get('options') as FormArray;
  }

  startSpeechRecognitionForQuestion(qindex: number) {
    this.selectedQuestionIndex = qindex;
    this.isOption = false;
    this.recognition.start();
  }
startSpeechRecognitionForOption(qindex: number, oindex: number) {
  this.selectedQuestionIndex = qindex;
  this.selectedOptionIndex = oindex;
  this.isOption = true;
  this.recognition.start();
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

  duplicateQuestion(qindex: number) {
    const questionsArray = this.forms.get('questions') as FormArray;
    const questionToDuplicate = questionsArray.at(qindex).value;

    // Clone the question, ensuring deep copy
    const duplicate = JSON.parse(JSON.stringify(questionToDuplicate));

    // Insert the duplicate question into the FormArray
    questionsArray.insert(qindex + 1, this.createQuestionFormGroup(duplicate));
  }
  createQuestionFormGroup(questionData: any): FormGroup {
    return this.fb.group({
      question_name: [questionData.question_name || ''],
      question_type: this.fb.group({
        name: [questionData.question_type?.name || ''],
        icon: [questionData.question_type?.icon || '']
      }),
      options: this.fb.array(
        (questionData.options || []).map((option:any) => this.fb.group({ op_1: [option.op_1 || ''] }))
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
        this.published()
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Canceled', detail: 'You have canceled the form' });
      },
    });
  }

  publish:boolean = false;

  published() {
    const url = `${APIURL}/forms`
    const formValues = this.forms.value;
    const questionMap = formValues.questions.map((question: any) => ({
      question_name: question.question_name,
      question_type: typeof question.question_type === 'object' ? question.question_type.name : question.question_type,
      options: question.options.map((option: any) => ({
        option_name: option.op_1
      }))
    }));
    const requestbody = {
      form_name: formValues.form_name,
      questions:questionMap
    }
    console.log(requestbody);
    this.httpclient.post(url, requestbody).subscribe(
      (res) => {
        this.publish = true;
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Your form has been published!' });
      }
    )
  }

}
