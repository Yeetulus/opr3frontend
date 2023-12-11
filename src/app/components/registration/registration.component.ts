import { Component } from '@angular/core';
import {AuthResponse, AuthService, RegistrationRequest} from "../../services/auth-service/auth.service";
import {Router} from "@angular/router";
import {NotificationService, NotificationType} from "../../services/notification-service/notification.service";

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

  constructor(private authService: AuthService, private router: Router, private notificationsService:NotificationService) {}

  register(): void {
    const request: RegistrationRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    this.authService.registerUser(request).subscribe({
      next: (response) => {
        this.authenticated(response);
        this.notificationsService.showNotification('Registration successful!', NotificationType.Success);
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.notificationsService.showNotification('Registration failed. Please try again.', NotificationType.Error);
      }
    });
  }

  authenticated(response: AuthResponse) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    this.router.navigate(['/login']);
  }
}
