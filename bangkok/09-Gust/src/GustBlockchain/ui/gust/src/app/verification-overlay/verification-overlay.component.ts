import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserAuthRequest } from '../model/user-object';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-verification-overlay',
  templateUrl: './verification-overlay.component.html',
  styleUrls: ['./verification-overlay.component.css']
})

export class VerificationOverlayComponent {
  @Input() isVisible: boolean = false;
  @Output() verificationComplete = new EventEmitter<boolean>();
  @Output() onTransaction = new EventEmitter<{ senderAccount: string, transactionAmount: number }>();
  @Output() onClose = new EventEmitter<void>();

  senderAccount: string = '';
  otp: string = '';
  isOtpVerified = false;
  transactionAmount: number = 100;
  currentStep: number = 1;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  nextStep(senderForm: NgForm) {
    if (senderForm.valid) {
      let payload: UserAuthRequest;

      if (this.currentStep === 1) {
        if (!this.senderAccount) {
          console.error('Phone number is required');
          this.notificationService.showNotification('Phone number is required', 'error');
          return;
        }

        const storedUser = this.userService.getUser();
        if (storedUser && storedUser.phone_number === this.senderAccount) {
          console.log('Phone number has not changed, skipping request');
          this.notificationService.showNotification('Phone number has not changed, skipping request', 'warning');
          this.currentStep++;
          return;
        }

        payload = { phone_number: this.senderAccount, otp: '' };

        this.userService.setUser({ phone_number: this.senderAccount });

        this.authService.userLogin(payload).subscribe(
          (response) => {
            console.log('Login request successful:', response);
          this.notificationService.showNotification(response.message, 'error');
            this.currentStep++;
          },
          (error) => {
            console.error('Login request failed:', error);
            this.notificationService.showNotification('Login request failed: '+error, 'error');

          }
        );
      } else if (this.currentStep === 2 && !this.isOtpVerified) {
        if (!this.otp) {
          console.error('OTP is required');
          this.notificationService.showNotification('OTP is required', 'error');
          return;
        }

        const storedUser = this.userService.getUser();
        if (!storedUser || !storedUser.phone_number) {
          console.error('Phone number is not available for OTP verification');
          return;
        }

        payload = { phone_number: storedUser.phone_number, otp: this.otp };

        this.authService.processOtp(payload).subscribe(
          (response) => {
            if (response.success) {
              console.log('OTP verification successful:', response);
              this.notificationService.showNotification(response.message, 'success');
              this.isOtpVerified = true;
              this.currentStep++;
            } else {
              console.error('OTP verification failed:', response.message);
              this.notificationService.showNotification(response.message, 'error');
            }
          },
          (error) => {
            console.error('OTP request failed:', error);
            this.notificationService.showNotification('OTP request failed: '+error, 'error');
          }
        );
        this.authService.processOtp(payload).subscribe(
          (response) => {
            if (response.success) {
              console.log('OTP verification successful:', response);
              this.notificationService.showNotification(response.message, 'success');
              this.isOtpVerified = true;
              this.verificationComplete.emit(true);
              this.currentStep++;
            } else {
              console.error('OTP verification failed:', response.message);
              this.notificationService.showNotification(response.message, 'error');
              this.verificationComplete.emit(false);
            }
          },
          (error) => {
            console.error('OTP request failed:', error);
            this.notificationService.showNotification('OTP request failed: ' + error, 'error');
            this.verificationComplete.emit(false);
          }
        );
      }
    }
  }


  prevStep() {
    this.currentStep--;
  }

  onSubmit(senderForm: NgForm) {
    if (senderForm.valid) {
      const payload: UserAuthRequest = {
        phone_number: this.userService.getUser().phone_number,
        otp: senderForm.value.otp
      };

      this.authService.processOtp(payload).subscribe(
        (response) => {
          if (response.success) {
            console.log('OTP verification successful:', response);
            this.notificationService.showNotification('Sender successfully verified.', 'success');
            this.isOtpVerified = true;
            this.verificationComplete.emit(true);
            this.currentStep++;
          } else {
            console.error('OTP verification failed:', response.message);
            this.notificationService.showNotification('Failed to verify sender.', 'error');
            this.verificationComplete.emit(false);
          }
        },
        (error) => {
          console.error('OTP request failed:', error);
          this.notificationService.showNotification('OTP request failed: ' + error, 'error');
          this.verificationComplete.emit(false);
        }
      );
      this.isVisible = false;
    }
  }

  closeOverlay() {
    this.onClose.emit();
  }
  setActiveTab(tabNumber: number): void {
    this.currentStep = tabNumber;
  }
}
