import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<{ message: string, type: string }>();

  getNotification() {
    return this.notificationSubject.asObservable();
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning') {
    this.notificationSubject.next({ message, type });
  }
  clearNotification(message: string, type: string) {
    this.notificationSubject.next({ message, type });
  }
}
