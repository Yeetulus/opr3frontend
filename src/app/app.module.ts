import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TaskComponent } from './components/task-component/task.component';
import { CategoryComponent } from './components/category-component/category.component';
import {MatCardModule} from "@angular/material/card";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { TaskBoardComponent } from './components/task-board/task-board.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { LoginComponent } from './components/login/login.component';
import {MatInputModule} from "@angular/material/input";
import { MainContentComponent } from './components/main-content/main-content.component';
import { AppRoutingModule } from './app-routing.module';
import {MatButtonModule} from "@angular/material/button";
import {HttpClientModule} from "@angular/common/http";
import { RegistrationComponent } from './components/registration/registration.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatMenuModule} from "@angular/material/menu";
import {MatSidenavModule} from "@angular/material/sidenav";
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import { CategoryFormComponent } from './components/category-form/category-form.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {ColorPickerModule} from "ngx-color-picker";
import { TaskFormComponent } from './components/task-form/task-form.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskComponent,
    CategoryComponent,
    TaskBoardComponent,
    LoginComponent,
    MainContentComponent,
    RegistrationComponent,
    SidebarComponent,
    CategoryFormComponent,
    TaskFormComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatCheckboxModule,
    HttpClientModule,
    FormsModule,
    MatInputModule,
    AppRoutingModule,
    MatButtonModule,
    MatGridListModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatSidenavModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    ColorPickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
