import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // 🔥 CLEAN PHONE (IMPORTANT)
  cleanPhone(phone: string) {
    return phone.replace(/\D/g, '');
  }

  submit() {

    const cleanPhone = this.cleanPhone(this.phone);

    if (this.isRegisterMode) {

      this.auth.register({ name: this.name, phone: cleanPhone })
        .subscribe({
          next: () => {
            alert('Registered! Now login');
            this.isRegisterMode = false;
          },
          error: () => alert('User already exists')
        });

    } else {

      this.auth.login({ phone: cleanPhone })
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