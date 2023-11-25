import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {MainContentComponent} from "./components/main-content/main-content.component";
import {AuthGuardService} from "./services/auth-guard/auth-guard.service";
import {RegistrationComponent} from "./components/registration/registration.component";
import {TaskBoardComponent} from "./components/task-board/task-board.component";
import {CategoryFormComponent} from "./components/category-form/category-form.component";

const mainRoutes: Routes = [
  { path: '', component: TaskBoardComponent },
  { path: 'add-category', component: CategoryFormComponent },
];

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'main', component: MainContentComponent, canActivate: [AuthGuardService], children: mainRoutes},
  { path: 'register', component: RegistrationComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
