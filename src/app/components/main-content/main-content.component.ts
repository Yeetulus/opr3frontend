import { Component } from '@angular/core';
import {AuthService} from "../../services/auth-service/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent {


  constructor(private authService : AuthService, private router : Router) {
  }

  logout() {
    this.authService.logout();
  }

  redirectToBoard() {
    this.router.navigate(['/main']);
  }
}
