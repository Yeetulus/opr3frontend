import { Component } from '@angular/core';
import {NotificationService, Notification} from "./services/notification-service/notification.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  notifications: Notification[] = [];
  title?: string;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notifications$.subscribe((notifications) => {
      this.notifications = notifications;
    });
  }

  clearNotification(index: number) {
    this.notificationService.clearNotification(index);
  }
}
