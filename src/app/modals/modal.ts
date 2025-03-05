export interface Login {
  token: string
  name: string
  email: string
  password: string
  id: number
}
export interface UserLoginDetail {
  id: number
  email: string
  password: number
  name: string
}

export interface Option {
  option_name: string
}

export interface Question {
  q_id?: number
  question_type: string | QuestionType
  question_name: string
  selectedIcon?: string
  options: Option[]
}

export interface Forms {
  id:number
  form_name: string
  link:string
  questions: Question[]
  screenshot: string
}


export interface QuestionType{
  name: string
  icon: string
}
