import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterModule
} from '@angular/router';

import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

  subscription: any = null;

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

      this.loadSubscription();

    }

  

  }

  loadSubscription() {

  if (!this.user?._id) return;

  this.http.get<any>(
    `${environment.apiUrl}/subscription/status/${this.user._id}`
  ).subscribe({

    next: (res) => {

      if (res.subscribed) {

        this.subscription = res;

      } else {

        this.subscription = null;

      }

    },

    error: (err) => {

      console.log(err);

    }

  });

}

  

  // 🔥 LOAD PAYMENTS

  loadPayments() {

    if (!this.user?._id) return;

    this.http.get<any[]>(
      `${environment.apiUrl}/payments/${this.user._id}`
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

  const lastBook =
    localStorage.getItem(
      `lastBook_${this.user._id}`
    );

  if (lastBook) {

    this.router.navigate([
      '/read',
      lastBook
    ]);

  } else {

    alert('No book started yet 📚');

  }

}

  // 🔥 GO LOGIN

  goLogin() {

    this.router.navigate(['/login']);

  }

  // 🔥 ADMIN LOGIN

  adminLogin() {

    this.http.post<any>(
       `${environment.apiUrl}/admin-login`,
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