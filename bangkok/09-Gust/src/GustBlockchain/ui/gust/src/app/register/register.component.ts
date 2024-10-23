import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserAuthRequest } from '../model/user-object';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  currentStep: number = 1;
  phone_number: string = '';
  otp: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {}

  nextStep(registerForm: NgForm) {
    if (registerForm.valid) {
      let payload: UserAuthRequest;

      if (this.currentStep === 1) {
        if (!this.phone_number) {
          console.error('Phone number is required');
          this.notificationService.showNotification('Phone number is required!', 'error');
          return;
        }

        const storedUser = this.userService.getUser();
        if (storedUser && storedUser.phone_number === this.phone_number) {
          console.log('Phone number has not changed, skipping request');
          this.currentStep++;
          return;
        }

        payload = { phone_number: this.phone_number, otp: '' };

        this.userService.setUser({ phone_number: this.phone_number });

        this.authService.createUser(payload).subscribe(
          (response) => {
            console.log('Sign-up request successful:', response);
            this.notificationService.showNotification('Sign-up request successful:', 'success');
            this.currentStep++;
          },
          (error) => {
            console.error('Sign-up request failed:', error);
            this.notificationService.showNotification('Sign-up request failed:', 'error');
          }
        );
      } else if (this.currentStep === 2) {
        if (!this.otp) {
          console.error('OTP is required');
          this.notificationService.showNotification('OTP is required', 'warning');
          return;
        }

        const storedUser = this.userService.getUser();
        if (!storedUser || !storedUser.phone_number) {
          console.error('Phone number is not available for OTP verification');
          this.notificationService.showNotification('Phone number is not available for OTP verification', 'error');
          return;
        }

        payload = { phone_number: storedUser.phone_number, otp: this.otp };

        this.authService.processOtp(payload).subscribe(
          (response) => {
            if (response.success) {
              console.log('OTP verification successful:', response);
              this.notificationService.showNotification(response.message, 'success');
              this.currentStep++;
            } else {
              console.error('OTP verification failed:', response.message);
              this.notificationService.showNotification(response.message, 'error');
            }
          },
          (error) => {
            console.error('OTP request failed:', error);
          }
        );
      } else {
        console.error('Invalid step');
      }
    }
  }

  prevStep() {
    this.currentStep--;
  }

  onSubmit(registerForm: NgForm) {
    if (registerForm.valid) {
      const payload: UserAuthRequest = {
        phone_number: this.userService.getUser().phone_number,
        otp: registerForm.value.otp
      };
      this.authService.processOtp(payload).subscribe(
        (response:any) => {
          console.log('OTP verification successful:', response);
          this.notificationService.showNotification(response.message, 'success');
          // localStorage.setItem('authToken', response.token);
          this.router.navigate(['/']);
        },
        (error: any) => {
          if (error.status === 400) {
            this.notificationService.showNotification(error.error.message, 'warning');
          } else {
            this.notificationService.showNotification(error.error.message, 'error');
          }
        }
      );
    }
  }

  setActiveTab(tabNumber: number): void {
    this.currentStep = tabNumber;
  }
}
