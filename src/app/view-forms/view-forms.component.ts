import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Question, QuestionType } from '../modals/modal';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { APIURL } from '../env';
import { CommonService } from '../services/commonService';

@Component({
  selector: 'app-view-forms',
  imports: [SharedModule, RouterLink, FormsModule, CommonModule, DragDropModule],
  templateUrl: './view-forms.component.html',
  styleUrl: './view-forms.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class ViewFormsComponent implements OnInit {

  values: string = 'Untitled form'
  value: number = 0;
  options: QuestionType[] | undefined
  questions: Question[] = [
    { question_name: this.values, question_type: { name: '', icon:''}, options: [{ op_1: '' }] }
  ];

  constructor(private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private httpclient: HttpClient,
    private commonService: CommonService
  ) { }
  ngOnInit() {
    this.commonService.getQuestionType().subscribe(
      (res) => {
        this.options = res
      }
    )
  }

  cloneInput(index: number) {
    this.questions[index].options.push({ op_1: '' });
  }
  removeInput(question: number, index: number) {
    if (this.questions[question]?.options?.length > 1) {
      this.questions[question]?.options?.splice(index, 1);
    }
  }
  updateSelectedOption(index: number) {
    const selectedOption = this.questions[index].question_type as QuestionType;
    if (selectedOption && selectedOption.name) {
      this.questions[index].selectedIcon = selectedOption.icon;
    }
  }


  addQuestion() {
    this.questions.push({
      question_name: '', question_type: { name: 'Multiple Choice', icon: 'pi pi-circle-off' }, options: [{ op_1: '' }]
    });
  }
  removeQuestion(qindex: number) {
    if (this.questions.length > 1) {
      this.questions.splice(qindex, 1);
    }
  }
  duplicateQuestion(qindex: number) {
    const duplicate = JSON.parse(JSON.stringify(this.questions[qindex]));
    this.questions.splice(qindex + 1, 0, duplicate);
  }

  dropQuestion(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
  }

  dropOption(event: CdkDragDrop<any[]>, qindex: number) {
    moveItemInArray(this.questions[qindex].options, event.previousIndex, event.currentIndex);
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

  published() {
    const url = `${APIURL}/forms`
    const questionMap = this.questions.map((question) => ({
      question_name: question.question_name,
      question_type: typeof question.question_type === 'object' ? question.question_type.name : question.question_type,
      options: question.options.map((option) => ({
      option_name:option.op_1
      }))
    }))
    const requestbody = {
      form_name: this.values,
      questions:questionMap
    }
    console.log(requestbody);

  }

}
// } this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Your form has been published!' });
