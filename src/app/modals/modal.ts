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
  op_1: string
  op_2?: string
}

export interface Question {
  question_type: string | QuestionType
  question_name: string
  selectedIcon?: string
  options: Option[]
}

export interface Form {
  form_name: string
  questions: Question[]
}


export interface QuestionType{
  name: string
  icon: string
}
