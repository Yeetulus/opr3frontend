import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {AuthRequest, AuthResponse, AuthService, RegistrationRequest} from "../../services/auth-service/auth.service";
import {NotificationService, NotificationType} from "../../services/notification-service/notification.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  constructor(private authService: AuthService, private router: Router, private notificationService: NotificationService) {}

  login(): void {
    const request: AuthRequest = { email: this.username, password: this.password };
    this.authService.login(request).subscribe(
      (response) => {
        this.authenticated(response);
        this.notificationService.showNotification('Login successful!', NotificationType.Success);
      },
      (error) => {
        console.error('Login failed', error);
        this.notificationService.showNotification('Login failed. Please check your credentials and try again.', NotificationType.Error);
      }
    );
  }

  authenticated(response: AuthResponse) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    this.router.navigate(['/main']);
  }

  register(): void {
    const request: RegistrationRequest = { firstName: '', lastName: '', email: this.username, password: this.password };
    this.authService.registerUser(request).subscribe(
      (response) => {
        this.authenticated(response);
      },
      (error) => {
        console.error('Registration failed', error);
      }
    );
  }
}
