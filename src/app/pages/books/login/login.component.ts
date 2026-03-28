import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  name = '';
  phone = '';
  isRegisterMode = true;
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  cleanPhone(phone: string) {
    return phone.replace(/\D/g, '');
  }

// 🔥 VALIDATE PHONE
  isValidPhone(phone: string) {
    return /^[0-9]{10}$/.test(phone);
  }

  submit() {

    const cleanPhone = this.cleanPhone(this.phone);

    // 🔴 VALIDATION
    if (!cleanPhone || (this.isRegisterMode && !this.name)) {
      alert('Enter valid 10 digit phone number ');
      return;
    }

    this.isLoading = true;

    if (this.isRegisterMode) {

      this.auth.register({ name: this.name, phone: cleanPhone })
        .subscribe({
          next: () => {
            this.isLoading = false;
            alert('Registered! Now login');
            this.isRegisterMode = false;
          },
          error: () => {
            this.isLoading = false;
            alert('User already exists ❌');
          }
        });

    } else {

      this.auth.login({ phone: cleanPhone })
        .subscribe({
          next: (res: any) => {
            this.isLoading = false;
            this.auth.saveToken(res.token);
            this.auth.saveUser(res.user);

            // 🔥 redirect after login
            const redirect = localStorage.getItem('redirectAfterLogin');
            if (redirect) {
              localStorage.removeItem('redirectAfterLogin');
              this.router.navigate([redirect]);
            } else {
              this.router.navigate(['/']);
            }
          },
          error: () => {
            this.isLoading = false;
            alert('User not found ❌');
          }
        });
    }
  }
}