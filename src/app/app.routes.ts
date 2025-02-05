import { Routes } from '@angular/router';
import { RegisterComponent } from './Authentication/register/register.component';
import { LoginComponent } from './Authentication/login/login.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {path:'login',component:LoginComponent},
  { path:'register', component:RegisterComponent}
];
