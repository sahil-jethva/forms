import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-respond-forms',
  imports: [],
  templateUrl: './respond-forms.component.html',
  styleUrl: './respond-forms.component.scss'
})
export class RespondFormsComponent implements OnInit {

  formId!:number

  constructor(private route:ActivatedRoute){}
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.formId = Number(params.get('formID'))
      console.log(this.formId);

    })
  }


}
