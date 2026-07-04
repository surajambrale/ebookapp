import { Component } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { environment }
from '../../../environments/environment';

import { RouterModule }
from '@angular/router';

@Component({

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl:
    './admin.component.html',

  styleUrls:
    ['./admin.component.scss']

})

export class AdminComponent {

  // 🔐 LOGIN

  password = '';

  isLoggedIn = false;

  token = '';

  // 🔥 DATA

  users: any[] = [];

  purchases: any[] = [];

  books: any[] = [];

  selectedUser = '';

  selectedBook = '';

  // 🔥 STATS

  stats: any;

  recentPurchases: any[] = [];

  totalRevenue = 0;

  // 🔍 SEARCH

  searchPhone = '';

  filteredUsers: any[] = [];

  filteredPurchases: any[] = [];

  // 🔥 SECTION FILTER

  selectedSection = 'recent';

  api = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  // ================= LOGIN =================

  login() {

    const cleanPassword =
      this.password.trim();

    this.http.post(

      `${this.api}/admin-login`,

      {
        password: cleanPassword
      }

    ).subscribe({

      next: (res: any) => {

        this.token = res.token;

        this.isLoggedIn = true;

        localStorage.setItem(
          'adminToken',
          this.token
        );

        this.loadData();

        this.loadStats();

      },

      error: () => {

        alert(
          'Wrong password ❌'
        );

      }

    });

  }

  // ================= LOAD DATA =================

  loadData() {

    const headers =
      new HttpHeaders({

        Authorization:
          this.token

      });

    // USERS

    this.http.get(

      `${this.api}/admin/users`,

      { headers }

    ).subscribe({

      next: (res: any) => {

        this.users = res;

        this.filteredUsers = res;

      }

    });

    // PURCHASES

    this.http.get(

      `${this.api}/admin/purchases`,

      { headers }

    ).subscribe({

      next: (res: any) => {

        this.purchases = res;

        this.filteredPurchases = res;

      }

    });

    // BOOKS

    this.http.get(

      `${this.api}/admin/books`,

      { headers }

    ).subscribe({

      next: (res: any) => {

        this.books = res;

      }

    });

  }

  // ================= LOAD STATS =================

  loadStats() {

    const headers =
      new HttpHeaders({

        Authorization:
          this.token

      });

    this.http.get<any>(

      `${this.api}/admin/stats`,

      { headers }

    ).subscribe({

      next: (res) => {

        this.stats = res;

        this.totalRevenue =
          res.totalRevenue;

        this.recentPurchases =
          res.recentPurchases;

      }

    });

  }

  // ================= SEARCH =================

  searchUser() {

    const phone =
      this.searchPhone.trim();

    // RESET

    if (!phone) {

      this.filteredUsers =
        this.users;

      this.filteredPurchases =
        this.purchases;

      return;

    }

    // FILTER USERS

    this.filteredUsers =
      this.users.filter(

        (u: any) =>

          u.phone.includes(phone)

      );

    // FILTER PURCHASES

    this.filteredPurchases =
      this.purchases.filter(

        (p: any) =>

          p.userPhone.includes(phone)

      );

  }

  // ================= ACCESS =================

  grantAccess() {

    if (
      !this.selectedUser
      ||
      !this.selectedBook
    ) {

      alert(
        'Select user & book ❌'
      );

      return;

    }

    const headers =
      new HttpHeaders({

        Authorization:
          this.token

      });

    this.http.post(

      `${this.api}/admin/grant-access`,

      {
        userId:
          this.selectedUser,

        bookId:
          this.selectedBook
      },

      { headers }

    ).subscribe({

      next: () => {

        alert(
          'Access granted ✅'
        );

        this.loadData();

        this.loadStats();

      }

    });

  }

  // ================= DELETE USER =================

  deleteUser(id: string) {

    const headers =
      new HttpHeaders({

        Authorization:
          this.token

      });

    this.http.delete(

      `${this.api}/admin/user/${id}`,

      { headers }

    ).subscribe({

      next: () => {

        alert(
          'User deleted ✅'
        );

        this.loadData();

        this.loadStats();

      }

    });

  }

  // ================= DELETE PURCHASE =================

  deletePurchase(id: string) {

    const headers =
      new HttpHeaders({

        Authorization:
          this.token

      });

    this.http.delete(

      `${this.api}/admin/purchase/${id}`,

      { headers }

    ).subscribe({

      next: () => {

        alert(
          'Purchase deleted ✅'
        );

        this.loadData();

        this.loadStats();

      }

    });

  }

  // ================= BOOK NAME =================

  getBookName(id: string) {

    const book =
      this.books.find(

        b =>

        b.id.toString()
        ===
        id.toString()

      );

    return book
      ? book.name
      : 'Unknown';

  }

  // ================= LOGOUT =================

  logout() {

    this.isLoggedIn = false;

    this.token = '';

    this.password = '';

    this.users = [];

    this.purchases = [];

    this.books = [];

    this.filteredUsers = [];

    this.filteredPurchases = [];

    this.stats = null;

    this.recentPurchases = [];

    localStorage.removeItem(
      'adminToken'
    );

  }

}