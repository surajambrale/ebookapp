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

  constructor(private auth: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  // 🔥 CLEAN PHONE (IMPORTANT)
  cleanPhone(phone: string) {
    return phone.replace(/\D/g, '');
  }
  isLoading = false;
  submit() {

    const cleanPhone = this.cleanPhone(this.phone);
    this.isLoading = true; // 🔥 START LOADER
    (window as any).appLoader = true; // 🔥 START
    if (this.isRegisterMode) {

      this.auth.register({ name: this.name, phone: cleanPhone })
        .subscribe({
          next: () => {
            // this.isLoading = false;
            (window as any).appLoader = false;
            alert('Registered! Now login');
            this.isRegisterMode = false;
          },
          error: () => {
           (window as any).appLoader = false;
          alert('User already exists');
        }
        });

    } else {

      this.auth.login({ phone: cleanPhone })
        .subscribe({
          next: (res: any) => {
            (window as any).appLoader = false;
            this.auth.saveToken(res.token);
            this.auth.saveUser(res.user);
            this.router.navigate(['/']);
          },
          error: () => {
          (window as any).appLoader = false;
          alert('User not found');
        }
        });
    }
  }
}