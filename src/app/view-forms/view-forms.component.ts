import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Forms, Question, QuestionType } from '../modals/modal';
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
  imports: [SharedModule, RouterLink, ReactiveFormsModule, CommonModule, DragDropModule],
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
    private router: Router,
    private route: ActivatedRoute
  ) { }
  forms!: FormGroup
  publish: boolean = false;
  formID!: number
  formData!: Forms;

  ngOnInit() {
    this.forms = this.fb.group({
      form_name: [''],
      questions: this.fb.array([])
    });
    this.addQuestion();

    this.route.paramMap.subscribe(params => {
      this.formID = params.get('id') ? Number(params.get('id')) : Number(params.get('id'));
      if (this.formID) {
        this.getFormById(this.formID);
      }
    });

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

  getFormById(id: number) {
    const url = `${APIURL}/forms/${id}`;
    this.httpclient.get<Forms>(url).subscribe(
      (data) => {
        this.formData = data;
        this.populateForm(this.formData);
      }
    );
  }

  populateForm(form: Forms) {
    this.publish = true;
    this.forms = this.fb.group({
      form_name: form.form_name,
      questions: this.fb.array(
        form.questions?.map(q => this.createQuestionFormGroup(q)) || []
      )
    });
  }

  activeField: { type: 'question_name' | 'option_name', qindex: number, oindex?: number } | null = null;

  setActiveField(type: 'question_name' | 'option_name', qindex: number, oindex?: number) {
    this.activeField = { type, qindex, oindex };
    console.log("Active Field:", this.activeField);
    this.startSpeechRecognition()
  }

  get questionsArray(): FormArray {
    return this.forms?.get('questions') as FormArray;
  }
  getOptionsArray(qindex: number): FormArray {
    return this.questionsArray?.at(qindex).get('options') as FormArray;
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
        } else if (this.activeField.type === 'option_name' && this.activeField.oindex !== undefined) {
          this.getOptionsArray(this.activeField.qindex).at(this.activeField.oindex).patchValue({ option_name: transcript });
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
      option_name: ['']
    });
  }


  // createQuestionFormGroup(questionData: any): FormGroup {
  //   return this.fb.group({
  //     question_name: [questionData.question_name || ''],
  //     question_type: [this.options?.find(opt => opt.name === questionData.question_type.name) || ''],
  //     options: this.fb.array(
  //       (questionData.options || []).map((option: any) => this.fb.group({ op_1: [option.option_name || ''] }))
  //     )
  //   });
  // }

  createQuestionFormGroup(questionData: any): FormGroup {
    return this.fb.group({
      question_name: [questionData.question_name || ''],
      question_type: [this.options?.find(opt => opt.name === questionData.question_type) || null], // Ensure correct object binding
      options: this.fb.array(
        (questionData.options || []).map((option: any) => this.fb.group({ option_name: [option.option_name || ''] }))
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

  // published(): Promise<number> {
  //   return new Promise((resolve) => {
  //     const url = `${APIURL}/forms`
  //     const formValues = this.forms.value;

  //     const questionMap = formValues.questions.map((question: any) => ({
  //       question_name: question.question_name,
  //       question_type: typeof question.question_type === 'object' ? question.question_type.name : question.question_type,
  //       options: question.options.map((option: any) => ({
  //         option_name: option.option_name
  //       }))
  //     }));
  //     const requestbody = {
  //       createdby_id: this.u_id,
  //       form_name: formValues.form_name,
  //       questions: questionMap
  //     }
  //     // if (this.formID) {
  //     // } else {
  //       this.httpclient.post<{ id: number }>(url, requestbody).subscribe(
  //         (res) => {
  //           this.publish = true;
  //           this.formID = res.id;
  //           this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Your form has been published!' });
  //           resolve(this.formID);
  //         }
  //       )
  //     // }
  //   })
  // }


  published(): Promise<number> {
    return new Promise((resolve) => {
      const url = this.formID ? `${APIURL}/forms/${this.formID}` : `${APIURL}/forms`;
      const formValues = this.forms.value;

      if (this.formID) {
        this.httpclient.get<any>(url).subscribe(existingForm => {
          const updatedQuestions = formValues.questions.map((question: any, index: number) => {
            const existingQuestion = existingForm.questions[index];

            return {
              q_id: existingQuestion?.q_id || index + 1,
              question_name: question?.question_name,
              question_type: question?.question_type
                ? (typeof question?.question_type === 'object' ? question?.question_type?.name : question?.question_type)
                : existingQuestion?.question_type,
              options: question?.options?.map((option: any) => ({
                option_name: option?.option_name
              }))
            };
          });

          const requestBody = {
            createdby_id: this.u_id,
            form_name: formValues.form_name,
            questions: updatedQuestions
          };

          this.httpclient.put<{ id: number }>(url, requestBody).subscribe(
            (res) => {
              this.publish = true;
              this.messageService.add({ severity: 'info', summary: 'Updated', detail: 'Your form has been updated!' });
              resolve(this.formID);
            }
          );
        });
      } else {
        // Handle new form (POST request)
        const questionMap = formValues.questions.map((question: any) => ({
          question_name: question?.question_name,
          question_type: typeof question?.question_type === 'object' ? question?.question_type?.name : question?.question_type,
          options: question?.options?.map((option: any) => ({
            option_name: option?.option_name
          }))
        }));

        const requestBody = {
          createdby_id: this.u_id,
          form_name: formValues.form_name,
          questions: questionMap
        };

        this.httpclient.post<{ id: number }>(url, requestBody).subscribe(
          (res) => {
            this.publish = true;
            this.formID = res.id;
            this.messageService.add({ severity: 'info', summary: 'Published', detail: 'Your form has been published!' });
            resolve(this.formID);
          }
        );
      }
    });
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
    this.router.navigate(['/respond-form',this.formID]);
  }

  questions: Question[] = []
  formName!: string
  getFormDetail() {
    const url = `${APIURL}/forms/${this.formID}`
    console.log(url);
    this.httpclient.get<Forms>(url).subscribe(
      (res) => {
        console.log(res);
        this.questions = res.questions
        this.formName = res.form_name
      }
    )
  }
}

// createQuestionFormGroup(questionData: any): FormGroup {
//   return this.fb.group({
//     question_name: [questionData.question_name || ''],
//     question_type: this.fb.group({
//       name: [questionData.question_type?.name || ''],
//       icon: [questionData.question_type?.icon || '']
//     }),
//     options: this.fb.array(
//       (questionData.options || []).map((option: any) => this.fb.group({ op_1: [option.option_name || ''] }))
//     )
//   });
// }
