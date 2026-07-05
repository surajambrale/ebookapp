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

  // 🔥 DROPDOWN
  selectedView = 'users';

  // 🔥 SEARCH
  searchPhone = '';
  searchedPurchases: any[] = [];

  // 🔥 ANALYTICS
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

      error: () => {

        alert('Wrong password ❌');

      }

    });

  }

  // 🔥 LOAD DATA
  loadData() {

  const headers = new HttpHeaders({
    Authorization: this.token
  });

  // 🔥 USERS
  this.http.get(`${this.api}/admin/users`, { headers })

    .subscribe((res: any) => {

      this.users = res;

    });

  // 🔥 BOOKS FIRST
  this.http.get(`${this.api}/admin/books`, { headers })

    .subscribe((booksRes: any) => {

      this.books = booksRes;

      // 🔥 PURCHASES AFTER BOOKS
      this.http.get(`${this.api}/admin/purchases`, { headers })

        .subscribe((purchaseRes: any) => {

          this.purchases = purchaseRes;

          // 🔥 NOW ANALYTICS
          this.calculateAnalytics();

        });

    });

}

  // 🔥 ANALYTICS
  calculateAnalytics() {

    this.totalRevenue = 0;
    this.todayRevenue = 0;
    this.weeklyRevenue = 0;
    this.monthlyRevenue = 0;

    const today = new Date();

    const topBooks: any = {};

    this.purchases.forEach((p: any) => {

      // 🔥 FALLBACK AMOUNT
      let amount = Number(p.amount || 0);

      // 🔥 OLD PURCHASE RECOVERY
      if (!amount || amount === 0) {

        if (p.bookId == '1') amount = 299;
        else if (p.bookId == '2') amount = 399;
        else if (p.bookId == '3') amount = 199;
        else if (p.bookId == '4') amount = 149;
        else if (p.bookId == '5') amount = 249;
        else if (p.bookId == '6') amount = 349;

      }

      // 🔥 TOTAL
      this.totalRevenue += amount;

      const purchaseDate = new Date(
        p.createdAt || p.date || new Date()
      );

      // 🔥 TODAY
      if (
        purchaseDate.toDateString() ===
        today.toDateString()
      ) {

        this.todayRevenue += amount;

      }

      // 🔥 WEEKLY
      const diffDays =

        (today.getTime() - purchaseDate.getTime()) /

        (1000 * 60 * 60 * 24);

      if (diffDays <= 7) {

        this.weeklyRevenue += amount;

      }

      // 🔥 MONTHLY
      if (

        purchaseDate.getMonth() === today.getMonth()

        &&

        purchaseDate.getFullYear() ===
        today.getFullYear()

      ) {

        this.monthlyRevenue += amount;

      }

      // 🔥 TOP SELLING
      topBooks[p.bookId] =

        (topBooks[p.bookId] || 0) + 1;

    });

    // 🔥 FIND TOP BOOK
    let max = 0;

    let topId = '';

    for (const id in topBooks) {

      if (topBooks[id] > max) {

        max = topBooks[id];

        topId = id;

      }

    }

    const book = this.books.find(

      b => b.id.toString() === topId.toString()

    );

    this.topSellingBook =

      book ? book.name : 'No Data';

    this.topSellingCount = max;

  }

  // 🔥 GET BOOK NAME
  getBookName(id: string) {

    const book = this.books.find(

      b => b.id.toString() === id.toString()

    );

    return book ? book.name : 'Unknown';

  }

  // 🔥 GET BOOK AMOUNT
  getBookAmount(bookId: string) {

    if (bookId == '1') return 299;
    if (bookId == '2') return 399;
    if (bookId == '3') return 199;
    if (bookId == '4') return 149;
    if (bookId == '5') return 249;
    if (bookId == '6') return 349;

    return 0;

  }

  // 🔥 SEARCH USER
  searchUser() {

    if (!this.searchPhone) {

      this.searchedPurchases = [];

      return;

    }

    this.searchedPurchases =

      this.purchases.filter((p: any) =>

        p.userPhone?.includes(this.searchPhone)

      );

  }

  // 🔥 EXPORT CSV
  exportCSV() {

    let csvRows = [];

    // 🔥 HEADERS
    csvRows.push([

      'Name',
      'Phone',
      'Book ID',
      'Book Name',
      'Amount',
      'Payment ID'

    ]);

    // 🔥 DATA
    this.purchases.forEach((p: any) => {

      let amount = Number(p.amount || 0);

      if (!amount || amount === 0) {

        amount = this.getBookAmount(p.bookId);

      }

      csvRows.push([

        p.userName || '',

        p.userPhone || '',

        p.bookId || '',

        this.getBookName(p.bookId),

        amount,

        p.paymentId || ''

      ]);

    });

    // 🔥 CSV
    const csvContent = csvRows

      .map(e => e.join(','))

      .join('\n');

    // 🔥 DOWNLOAD
    const blob = new Blob([csvContent], {

      type: 'text/csv;charset=utf-8;'

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