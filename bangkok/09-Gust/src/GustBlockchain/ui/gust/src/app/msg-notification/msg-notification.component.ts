import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-msg-notification',
  templateUrl: './msg-notification.component.html',
  styleUrls: ['./msg-notification.component.css']
})
export class MsgNotificationComponent implements OnInit{
  message: string = '';
  messageType: string = ''

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.getNotification().subscribe(({ message, type }) => {
      this.message = message;
      this.messageType = type;

      setTimeout(() => {
        this.notificationService.clearNotification('', '');
      }, 5000);
    });
  }
}
