import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterModule
} from '@angular/router';

import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: any;

  isLoggedIn = false;

  selectedRole = 'user';

  adminPassword = '';

  payments: any[] = [];

  // 🔥 NEW FEATURES
  purchasedBooksCount = 0;

  continueReadingBook: any = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    const storedUser =
      localStorage.getItem('user');

    if (storedUser) {

      this.user =
        JSON.parse(storedUser);

      this.isLoggedIn = true;

      this.loadPayments();

    }

  }

  // 🔥 LOAD PAYMENTS

  loadPayments() {

    if (!this.user?._id) return;

    this.http.get<any[]>(
      `https://ebookapp.onrender.com/payments/${this.user._id}`
    )
    .subscribe({

      next: (res) => {

        this.payments = res;

        console.log(
          'Payments:',
          res
        );

        // 🔥 PURCHASED BOOK COUNT
        this.purchasedBooksCount =
          this.payments.length;

        // 🔥 CONTINUE READING
        if (this.payments.length > 0) {

          this.continueReadingBook =
            this.payments[0];

        }

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  // 🔥 CONTINUE READING

  continueReading() {

    if (!this.continueReadingBook) return;

    this.router.navigate([
      '/book',
      this.continueReadingBook.bookId
    ]);

  }

  // 🔥 GO LOGIN

  goLogin() {

    this.router.navigate(['/login']);

  }

  // 🔥 ADMIN LOGIN

  adminLogin() {

    this.http.post<any>(
      'https://ebookapp.onrender.com/admin-login',
      {
        password: this.adminPassword
      }
    )
    .subscribe({

      next: () => {

        this.router.navigate(['/admin']);

      },

      error: () => {

        alert('Wrong Admin Password ❌');

      }

    });

  }

  // 🔥 LOGOUT

  logout() {

    localStorage.removeItem('user');

    this.isLoggedIn = false;

    this.user = null;

    this.router.navigate(['/login']);

  }

}