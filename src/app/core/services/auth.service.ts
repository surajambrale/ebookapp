import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {

 constructor(private http: HttpClient) {} // ✅ ADD THIS

 login(data: any) {
  return this.http.post('http://localhost:5000/auth', data);
}

saveUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

getUser() {
  return JSON.parse(localStorage.getItem('user') || '{}');
}

saveToken(token: string) {
  localStorage.setItem('token', token);
}

isLoggedIn() {
  return !!localStorage.getItem('token');
}

logout() {
  localStorage.clear();
}
}