import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  login() {
    localStorage.setItem('user', 'true');
  }

  logout() {
    localStorage.removeItem('user');
  }

  isLoggedIn() {
    return !!localStorage.getItem('user');
  }
}