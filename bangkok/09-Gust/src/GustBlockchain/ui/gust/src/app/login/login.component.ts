import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserAuthRequest } from '../model/user-object';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  currentStep: number = 1;
  phone_number: string = '';
  otp: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  nextStep(loginForm: NgForm) {
    if (loginForm.valid) {
      let payload: UserAuthRequest;

      if (this.currentStep === 1) {
        if (!this.phone_number) {
          console.error('Phone number is required');
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

        this.authService.userLogin(payload).subscribe(
          (response) => {
            console.log('Login request successful:', response);
            this.currentStep++;
          },
          (error) => {
            console.error('Login request failed:', error);
          }
        );
      } else if (this.currentStep === 2) {
        if (!this.otp) {
          console.error('OTP is required');
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
              this.currentStep++;
            } else {
              console.error('OTP verification failed:', response.message);
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

  onSubmit(loginForm: NgForm) {
    if (loginForm.valid) {
      const payload: UserAuthRequest = {
        phone_number: this.userService.getUser().phone_number,
        otp: loginForm.value.otp
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
