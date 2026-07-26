import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  name = '';
  phone = '';

  // NEW
  email = '';
  password = '';
  confirmPassword = '';

  isRegisterMode = true;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  cleanPhone(phone: string) {
    return phone.replace(/\D/g, '');
  }

  isValidPhone(phone: string) {
    return /^[0-9]{10}$/.test(phone);
  }

  submit() {

    // REGISTER
    if (this.isRegisterMode) {

      const cleanPhone = this.cleanPhone(this.phone);

      if (!this.name.trim()) {
        alert('Name Required');
        return;
      }

      if (!this.isValidPhone(cleanPhone)) {
        alert('Invalid Phone Number');
        return;
      }

      if (!this.email.trim()) {
        alert('Email Required');
        return;
      }

      if (!this.password.trim()) {
        alert('Password Required');
        return;
      }

      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      this.isLoading = true;

      this.auth.register({

        name: this.name.trim(),

        phone: cleanPhone,

        email: this.email.trim(),

        password: this.password

      })

        .subscribe({

          next: () => {

  this.isLoading = false;

  alert("Registered Successfully ✅");

   // Register → Login
  this.isRegisterMode = false;

  // Register fields clear
  this.name = '';
  this.phone = '';
  this.confirmPassword = '';

},

          error: (err) => {

            this.isLoading = false;

            alert(err.error.message);

          }

        });

    }

    // LOGIN
    else {

      if (!this.email.trim()) {

        alert('Email Required');

        return;

      }

      if (!this.password.trim()) {

        alert('Password Required');

        return;

      }

      this.isLoading = true;

      this.auth.login({

        email: this.email.trim(),

        password: this.password

      })

        .subscribe({

          next: (res: any) => {

            this.isLoading = false;

            this.auth.saveToken(res.token);

            this.auth.saveUser(res.user);

            this.router.navigate(['/']);

          },

          error: (err) => {

            this.isLoading = false;

            alert(err.error.message);

          }

        });

    }

  }

}