import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: any;

  setUser(userData: any) {
    this.user = userData;
  }

  getUser() {
    return this.user;
  }

  clearUser() {
    this.user = null;
  }
}
