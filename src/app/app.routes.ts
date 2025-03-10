import { Routes } from '@angular/router';
import { RegisterComponent } from './Authentication/register/register.component';
import { LoginComponent } from './Authentication/login/login.component';
import { AuthGuardService } from './services/auth-guard.service';
import { FormsComponent } from './forms/forms.component';
import { ProtectedAuthGuardService } from './services/protected-auth-guard.service';
import { LogoutComponent } from './Authentication/logout/logout.component';
import { ViewFormsComponent } from './view-forms/view-forms.component';
import { RespondFormsComponent } from './respond-forms/respond-forms.component';

export const routes: Routes = [
  {path:'', component: LoginComponent, canActivate: [AuthGuardService] },
  {path:'forms', component: FormsComponent, canActivate: [ProtectedAuthGuardService] },
  {path: 'form-edit/new', component: ViewFormsComponent, canActivate: [ProtectedAuthGuardService] },
  {path: 'form-edit/:id', component: ViewFormsComponent, canActivate: [ProtectedAuthGuardService] },
  { path: 'respond-form', component: RespondFormsComponent },
  { path: 'respond-form/:id', component: RespondFormsComponent },
  {path:'register', component: RegisterComponent },
  {path:'logout',component:LogoutComponent}
];
