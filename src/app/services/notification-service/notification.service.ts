import { Injectable } from '@angular/core';
import {async, BehaviorSubject, take, timer} from "rxjs";

export enum NotificationType {
  Success = 'success',
  Error = 'error',
}

export interface Notification {
  message: string;
  type: NotificationType;
  duration: number;
  remove: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private notificationTime = 3000;
  constructor() {}

  showNotification(message: string, type: NotificationType = NotificationType.Success, duration: number = this.notificationTime) {
    const notification: Notification = { message, type, duration, remove: () => this.clearNotification(this.notificationsSubject.value.indexOf(notification)) };

    this.notificationsSubject.next([...this.notificationsSubject.value, notification]);

    if (duration > 0) {
      timer(duration)
        .pipe(take(1))
        .subscribe(() => notification.remove());
    }
  }

  clearNotification(index: number) {
    const currentNotifications = this.notificationsSubject.value;
    currentNotifications.splice(index, 1);
    this.notificationsSubject.next(currentNotifications);
  }
}
