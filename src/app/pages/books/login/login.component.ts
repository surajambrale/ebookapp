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

  // 🔥 CLEAN PHONE
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
    if (!this.isValidPhone(cleanPhone)) {
      alert('Enter valid 10 digit phone number ❌');
      return;
    }

    if (this.isRegisterMode && !this.name.trim()) {
      alert('Name required ❌');
      return;
    }

    this.isLoading = true;

    if (this.isRegisterMode) {

      this.auth.register({ name: this.name.trim(), phone: cleanPhone })
        .subscribe({
          next: () => {
            this.isLoading = false;
            alert('Registered successfully ✅ Please login');
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
            this.router.navigate(['/']);
          },
          error: () => {
            this.isLoading = false;
            alert('User not found ❌');
          }
        });
    }
  }
}