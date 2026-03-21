import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [ CommonModule ,FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  name = '';
  phone = '';
  isRegisterMode = true;

  constructor(private auth: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  submit() {

    if (this.isRegisterMode) {
      // REGISTER
      this.auth.register({ name: this.name, phone: this.phone })
        .subscribe({
          next: () => {
            alert('Registered! Now login');
            this.isRegisterMode = false;
          },
          error: () => alert('User already exists')
        });

    } else {
      // LOGIN
      this.auth.login({ phone: this.phone })
        .subscribe({
          next: (res: any) => {
            this.auth.saveToken(res.token);
            this.auth.saveUser(res.user);
            this.router.navigate(['/']);
          },
          error: () => alert('User not found, please register')
        });
    }
  }
}