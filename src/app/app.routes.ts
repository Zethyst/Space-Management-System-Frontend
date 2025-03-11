import { DirectorComponent } from './director/director.component';
import { Routes } from '@angular/router';
import { UserComponent } from './user/user.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { LoginComponent } from './user/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './shared/auth.guard';
import { AdminOnlyComponent } from './authorizeDemo/admin-only/admin-only.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { claimReq } from './shared/utils/claimReq-utils';
import { EngineerComponent } from './engineer/engineer.component';
import { ScientistComponent } from './scientist/scientist.component';
import { ResearchAssistantComponent } from './research-assistant/research-assistant.component';
import { AstronomerComponent } from './astronomer/astronomer.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationViewOnlyComponent } from './notification-view-only/notification-view-only.component';

export const routes: Routes = [
  { path: '', redirectTo: '/signin', pathMatch: 'full' },
  {
    path: '', component: UserComponent,
    children: [
      { path: 'signup', component: RegistrationComponent },
      { path: 'signin', component: LoginComponent },
    ]
  },
  {
    path: '', component: MainLayoutComponent, canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard', component: DashboardComponent
      },
      {
        path: 'admin-only', component: AdminOnlyComponent,
        data: { claimReq: claimReq.adminOnly }
      },
      {
        path: 'director', component: DirectorComponent,
        data: { claimReq: claimReq.director }
      },
      {
        path: 'engineer', component: EngineerComponent,
        data: { claimReq: claimReq.engineer }
      },
      {
        path: 'scientist', component: ScientistComponent,
        data: { claimReq: claimReq.scientist }
      },
      {
        path: 'research-assistant', component: ResearchAssistantComponent,
        data: { claimReq: claimReq.researchAssistant }
      },
      {
        path: 'astronomer', component: AstronomerComponent,
        data: { claimReq: claimReq.astronomer }
      },
      {
        path: 'notification', component: NotificationComponent,
        data: { claimReq: claimReq.notification }
      },
      {
        path: 'notifications', component: NotificationViewOnlyComponent,
      },
      {
        path: 'forbidden', component: ForbiddenComponent
      }
    ]
  },

];
