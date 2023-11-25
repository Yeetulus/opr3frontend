import { Component } from '@angular/core';
import {AuthResponse, AuthService, RegistrationRequest} from "../../services/auth-service/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    const request: RegistrationRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    this.authService.registerUser(request).subscribe(
      (response) => {
        this.authenticated(response);
      },
      (error) => {
        console.error('Registration failed', error);
      }
    );
  }

  authenticated(response: AuthResponse) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    this.router.navigate(['/login']);
  }
}
