import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroment/enviroment.development';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserAuthRequest } from '../model/user-object';


interface SignupResponse {
  success: boolean;
  message: string;
}

interface OtpResponse {
  success: boolean;
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private URL: string = environment.AUTH_API_URL;

  constructor(private http: HttpClient) {}

  createUser(formBody: UserAuthRequest): Observable<SignupResponse> {
    const route: string = "/api/signup";
    return this.http.post<SignupResponse>(this.URL + route, formBody);
  }

  processOtp(formBody: UserAuthRequest): Observable<OtpResponse> {
    const route: string = "/api/verify-otp";
    return this.http.post<OtpResponse>(this.URL + route, formBody);
  }

  userLogin(formBody: UserAuthRequest): Observable<any> {
    const route: string = "/api/login";
    return this.http.post(this.URL + route, formBody);
  }
}
