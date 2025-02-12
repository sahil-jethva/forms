import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { APIURL } from "../env";
import { QuestionType, UserLoginDetail } from "../modals/modal";


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(private httpclient: HttpClient) { }

  getQuestionType() {
    return this.httpclient.get<QuestionType[]>(`${APIURL}/question_type`)
  }
  getMe() {
    return this.httpclient.get<{ user: UserLoginDetail }>(`${APIURL}/me`)
  }
}
