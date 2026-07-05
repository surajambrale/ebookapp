import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  selectedUser = '';
  selectedBook = '';

  searchTerm = '';

  // 🔥 DASHBOARD STATS
  totalRevenue = 0;
  todayRevenue = 0;
  weeklyRevenue = 0;
  monthlyRevenue = 0;

  topSellingBook = '';
  topSellingCount = 0;

  api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login() {

    const cleanPassword = this.password.trim();

    this.http.post(`${this.api}/admin-login`, {
      password: cleanPassword
    })
    .subscribe({
      next: (res: any) => {

        this.token = res.token;

        this.isLoggedIn = true;

        this.loadData();

      },
      error: () => alert('Wrong password ❌')
    });

  }

  // 🔥 LOAD DATA
  loadData() {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    // USERS
    this.http.get(`${this.api}/admin/users`, { headers })
      .subscribe((res: any) => {
        this.users = res;
      });

    // PURCHASES
    this.http.get(`${this.api}/admin/purchases`, { headers })
      .subscribe((res: any) => {

        this.purchases = res;

        this.calculateRevenue();

        this.calculateTopSelling();

      });

    // BOOKS
    this.http.get(`${this.api}/admin/books`, { headers })
      .subscribe((res: any) => {
        this.books = res;
      });

  }

  // 🔥 REVENUE CALCULATIONS
  calculateRevenue() {

    const today = new Date();

    this.totalRevenue = 0;
    this.todayRevenue = 0;
    this.weeklyRevenue = 0;
    this.monthlyRevenue = 0;

    this.purchases.forEach((p: any) => {

      const amount = Number(p.amount || 0);

      this.totalRevenue += amount;

      const purchaseDate = new Date(p.createdAt);

      // TODAY
      if (
        purchaseDate.toDateString() === today.toDateString()
      ) {
        this.todayRevenue += amount;
      }

      // WEEKLY
      const diffDays =
        (today.getTime() - purchaseDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diffDays <= 7) {
        this.weeklyRevenue += amount;
      }

      // MONTHLY
      if (
        purchaseDate.getMonth() === today.getMonth() &&
        purchaseDate.getFullYear() === today.getFullYear()
      ) {
        this.monthlyRevenue += amount;
      }

    });

  }

  // 🔥 TOP SELLING BOOK
  calculateTopSelling() {

    const counts: any = {};

    this.purchases.forEach((p: any) => {

      counts[p.bookId] = (counts[p.bookId] || 0) + 1;

    });

    let max = 0;
    let topBookId = '';

    for (const id in counts) {

      if (counts[id] > max) {

        max = counts[id];

        topBookId = id;

      }

    }

    const book = this.books.find(
      b => b.id.toString() === topBookId.toString()
    );

    this.topSellingBook = book ? book.name : 'N/A';

    this.topSellingCount = max;

  }

  // 🔥 BOOK NAME
  getBookName(id: string) {

    const book = this.books.find(
      b => b.id.toString() === id.toString()
    );

    return book ? book.name : 'Unknown';

  }

  // 🔥 FILTERED PURCHASES
  get filteredPurchases() {

    if (!this.searchTerm) return this.purchases;

    return this.purchases.filter((p: any) =>

      p.userPhone?.includes(this.searchTerm) ||

      p.userName?.toLowerCase()
        .includes(this.searchTerm.toLowerCase())

    );

  }

  // 🔥 EXPORT CSV
  exportCSV() {

    let csv =
`Name,Phone,Book Name,Amount,Payment ID\n`;

    this.filteredPurchases.forEach((p: any) => {

      csv +=
`${p.userName},
${p.userPhone},
${this.getBookName(p.bookId)},
${p.amount},
${p.paymentId}\n`;

    });

    const blob = new Blob([csv], {
      type: 'text/csv'
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'purchases.csv';

    a.click();

  }

  // 🔥 GRANT ACCESS
  grantAccess() {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.post(`${this.api}/admin/grant-access`, {

      userId: this.selectedUser,
      bookId: this.selectedBook

    }, { headers })

    .subscribe({
      next: () => {
        alert('Access Granted ✅');
        this.loadData();
      },
      error: () => {
        alert('Error ❌');
      }
    });

  }

  // 🔥 DELETE USER
  deleteUser(id: string) {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.delete(`${this.api}/admin/user/${id}`, { headers })

    .subscribe(() => {

      alert('User Deleted ✅');

      this.loadData();

    });

  }

  // 🔥 DELETE PURCHASE
  deletePurchase(id: string) {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.delete(`${this.api}/admin/purchase/${id}`, { headers })

    .subscribe(() => {

      alert('Purchase Deleted ✅');

      this.loadData();

    });

  }

  // 🔓 LOGOUT
  logout() {

    this.isLoggedIn = false;

    this.token = '';

    this.password = '';

  }

}