import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:20px">
      <h2>Login</h2>
      <button (click)="login()">Login</button>
    </div>
  `
})
export class LoginComponent {

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login();
    this.router.navigate(['/']);
  }
}