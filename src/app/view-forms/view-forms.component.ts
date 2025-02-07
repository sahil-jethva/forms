import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { City } from '../modals/modal';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-forms',
  imports: [SharedModule, RouterLink, FormsModule,CommonModule],
  templateUrl: './view-forms.component.html',
  styleUrl: './view-forms.component.scss'
})
export class ViewFormsComponent implements OnInit {

  values: string = 'Untitled form'
  value: number = 0;
  question: string = ''
  cities: City[] | undefined
  addOptions: string = ''
  selectedIcon: string = "";
  selectedOption: any = null;
  formInputs: any[] = [{ addOptions: '' }]
  questions: any[] = [
    {
      text: '',
      selectedOption: { name: 'Multiple Choice', icon: 'pi pi-circle-off' },
      selectedIcon: 'pi pi-circle-off',
      formInputs: [{ addOptions: '' }],
    }
  ];
  ngOnInit() {
    this.cities = [
      { icon: 'pi pi-align-left',name: 'Short answer'},
      { icon: 'pi pi-align-justify',name: 'Paragraph'},
      { icon: 'pi pi-circle-off',name: 'Multiple Choice'},
      { icon: 'pi pi-check-square',name: 'Checkbox'},
      { icon: 'pi pi-chevron-circle-down',name: 'Dropdown'},
    ]
  }

  cloneInput(index: number) {
    this.questions[index].formInputs.push({ addOptions: '' });
  }
  removeInput(question: number, index: number) {
    if (this.questions[question]?.formInputs?.length > 1) {
      this.questions[question]?.formInputs?.splice(index, 1);
    }
  }
  updateSelectedOption(index:number) {
    const selected = this.questions[index].selectedOption;
    this.questions[index].selectedIcon = selected.icon;
  }

  addQuestion() {
    this.questions.push({
      text: '',
      selectedOption: { name: 'Multiple Choice', icon: 'pi pi-circle-off' },
      selectedIcon: 'pi pi-circle-off',
      formInputs: [{ addOptions: '' }],
    });
  }
  removeQuestion(qindex: number) {
    if (this.questions.length > 1) {
      this.questions.splice(qindex, 1);
    }
  }
}
