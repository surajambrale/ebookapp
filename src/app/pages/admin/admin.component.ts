import { Component } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { environment } from '../../../environments/environment';

import { RouterModule } from '@angular/router';

import * as XLSX from 'xlsx';

import { saveAs } from 'file-saver';

@Component({
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl: './admin.component.html',

  styleUrls: ['./admin.component.scss']
})

export class AdminComponent {

  password = '';

  isLoggedIn = false;

  token = '';

  users: any[] = [];

  purchases: any[] = [];

  books: any[] = [];

  filteredUsers: any[] = [];

  filteredPurchases: any[] = [];

  selectedUser = '';

  selectedBook = '';

  section = 'dashboard';

  searchTerm = '';

  dashboardStats: any = {};

  api = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  // 🔐 LOGIN

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

        this.loadData();

      },

      error: () => {

        alert('Wrong Password ❌');

      }

    });

  }

  // 🔥 LOAD DATA

  loadData() {

    const headers =
      new HttpHeaders({

        Authorization: this.token

      });

    // USERS

    this.http.get(
      `${this.api}/admin/users`,
      { headers }

    ).subscribe((res: any) => {

      this.users = res;

      this.filteredUsers = res;

    });

    // PURCHASES

    this.http.get(
      `${this.api}/admin/purchases`,
      { headers }

    ).subscribe((res: any) => {

      this.purchases = res;

      this.filteredPurchases = res;

    });

    // BOOKS

    this.http.get(
      `${this.api}/admin/books`,
      { headers }

    ).subscribe((res: any) => {

      this.books = res;

    });

    // DASHBOARD

    this.http.get(
      `${this.api}/admin/dashboard-stats`,
      { headers }

    ).subscribe((res: any) => {

      this.dashboardStats = res;

    });

  }

  // 🔥 SEARCH

  searchData() {

    const term =
      this.searchTerm.toLowerCase();

    this.filteredUsers =
      this.users.filter((u: any) =>

        u.phone?.includes(term) ||

        u.name?.toLowerCase()
          .includes(term)

      );

    this.filteredPurchases =
      this.purchases.filter((p: any) =>

        p.userPhone?.includes(term) ||

        p.userName?.toLowerCase()
          .includes(term)

      );

  }

  // 🔥 ACCESS

  grantAccess() {

    if (
      !this.selectedUser ||
      !this.selectedBook
    ) {

      alert('Select User & Book ❌');

      return;

    }

    const headers =
      new HttpHeaders({

        Authorization: this.token

      });

    this.http.post(

      `${this.api}/admin/grant-access`,

      {
        userId: this.selectedUser,
        bookId: this.selectedBook
      },

      { headers }

    ).subscribe({

      next: () => {

        alert('Access Granted ✅');

        this.loadData();

      },

      error: (err) => {

        alert(
          err.error.message ||
          'Error ❌'
        );

      }

    });

  }

  // 🔥 DELETE USER

  deleteUser(id: string) {

    const headers =
      new HttpHeaders({

        Authorization: this.token

      });

    this.http.delete(
      `${this.api}/admin/user/${id}`,
      { headers }

    ).subscribe(() => {

      alert('User Deleted ✅');

      this.loadData();

    });

  }

  // 🔥 DELETE PURCHASE

  deletePurchase(id: string) {

    const headers =
      new HttpHeaders({

        Authorization: this.token

      });

    this.http.delete(
      `${this.api}/admin/purchase/${id}`,
      { headers }

    ).subscribe(() => {

      alert('Purchase Deleted ✅');

      this.loadData();

    });

  }

  // 🔥 EXPORT EXCEL

  exportExcel() {

    const worksheet =
      XLSX.utils.json_to_sheet(
        this.purchases
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Purchases'
    );

    const excelBuffer =
      XLSX.write(workbook, {

        bookType: 'xlsx',

        type: 'array'

      });

    const blob = new Blob(
      [excelBuffer],
      {
        type:
          'application/octet-stream'
      }
    );

    saveAs(
      blob,
      'purchases.xlsx'
    );

  }

  // 🔥 LOGOUT

  logout() {

    this.isLoggedIn = false;

    this.token = '';

    this.password = '';

    this.users = [];

    this.purchases = [];

  }

  // 🔥 BOOK NAME

  getBookName(id: string) {

    const book =
      this.books.find(

        b =>
          b.id.toString() ===
          id.toString()

      );

    return book
      ? book.name
      : 'Unknown';

  }

}