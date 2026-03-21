import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:20px">
      <h2>Login</h2>
      <button (click)="login()">Login</button>
    </div>
  `
})
export class LoginComponent {

  name: string = '';
  phone: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
  this.auth.login({ name: this.name, phone: this.phone })
    .subscribe((res: any) => {
      this.auth.saveToken(res.token);
      this.auth.saveUser(res.user);
      this.router.navigate(['/']);
    });
}
}