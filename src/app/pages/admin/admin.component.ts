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
  subscriptions: any[] = [];

  selectedUser = '';
  selectedBook = '';

  // 🔥 DROPDOWN
  selectedView = 'users';

  // 🔥 SEARCH
  searchPhone = '';
  searchedPurchases: any[] = [];

  //testimonial code start
  testimonials: any[] = [];

  // book upload code start

  // =============================
  // DYNAMIC BOOK UPLOAD
  // =============================

  newBook = {

  title: '',

  author: '',

  category: '',

  description: '',

  price: 0,

  originalPrice: 0

};

selectedCover!: File;

selectedPdf!: File;

  // =============================
  // COVER IMAGE SELECT
  // =============================

 onCoverSelected(event: any) {

  this.selectedCover = event.target.files[0];

}



  // =============================
  // PDF SELECT
  // =============================

  onPdfSelected(event: any) {

  this.selectedPdf = event.target.files[0];

}

  // =============================
  // UPLOAD BOOK
  // =============================

  uploadBook() {

  const formData = new FormData();

  formData.append('title', this.newBook.title);

  formData.append('author', this.newBook.author);

  formData.append('category', this.newBook.category);

  formData.append('description', this.newBook.description);

  formData.append('price', this.newBook.price.toString());

  formData.append('originalPrice', this.newBook.originalPrice.toString());

  formData.append('cover', this.selectedCover);

  formData.append('pdf', this.selectedPdf);

  const headers = new HttpHeaders({

    Authorization: this.token

  });

  this.http.post(

    `${this.api}/admin/books/upload`,

    formData,

    { headers }

  ).subscribe({

    next: () => {

      alert('Book Uploaded Successfully ✅');

      this.loadData();

      this.newBook = {

        title: '',

        author: '',

        category: '',

        description: '',

        price: 0,

        originalPrice: 0

      };

    },

    error: (err) => {

      console.log(err);

      alert('Upload Failed ❌');

    }

  });

}

  // book upload code end

  // 🔥 LOAD TESTIMONIALS
  loadTestimonials() {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.get(`${this.api}/admin/testimonials`, { headers })

      .subscribe({

        next: (res: any) => {

          this.testimonials = res;

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  // 🔥 DELETE TESTIMONIAL
  deleteTestimonial(id: string) {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.delete(`${this.api}/admin/testimonial/${id}`, { headers })

      .subscribe({

        next: () => {

          alert('Testimonial Deleted ✅');

          this.loadTestimonials();

        },

        error: () => {

          alert('Delete Failed ❌');

        }

      });

  }

  // 🔥 EXPORT TESTIMONIAL CSV
  exportTestimonialsCSV() {

    let csvRows = [];

    csvRows.push([
      'Name',
      'Message',
      'Rating',
      'Date'
    ]);

    this.testimonials.forEach((t: any) => {

      csvRows.push([

        t.name || '',

        t.message || '',

        t.rating || '',

        new Date(t.createdAt).toLocaleDateString()

      ]);

    });

    const csvContent = csvRows
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'testimonials.csv';

    a.click();

  }
  //testimonial code end

  // 🔥 ANALYTICS
  totalRevenue = 0;
  todayRevenue = 0;
  weeklyRevenue = 0;
  monthlyRevenue = 0;

  topSellingBook = '';
  topSellingCount = 0;

  api = environment.apiUrl;

  constructor(private http: HttpClient) { }

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

            // 🔥 LOAD TESTIMONIALS
            this.loadTestimonials();

            // 🔥 LOAD SUBSCRIPTIONS
            this.loadSubscriptions();

          });





      });



  }

  // 🔥 ANALYTICS
  // 🔥 ANALYTICS
  calculateAnalytics() {

    this.totalRevenue = 0;
    this.todayRevenue = 0;
    this.weeklyRevenue = 0;
    this.monthlyRevenue = 0;

    const today = new Date();

    const topBooks: any = {};

    this.purchases.forEach((p: any) => {

      // 🔥 BOOK PRICE
      const amount = this.getBookAmount(p.bookId);

      // 🔥 TOTAL REVENUE
      this.totalRevenue += amount;

      // 🔥 PURCHASE DATE
      const purchaseDate = new Date(p.createdAt);

      // 🔥 INVALID DATE CHECK
      if (isNaN(purchaseDate.getTime())) {
        return;
      }

      // 🔥 TODAY REVENUE
      const isToday =
        purchaseDate.getDate() === today.getDate() &&
        purchaseDate.getMonth() === today.getMonth() &&
        purchaseDate.getFullYear() === today.getFullYear();

      if (isToday) {
        this.todayRevenue += amount;
      }

      // 🔥 WEEKLY REVENUE
      const diffTime =
        today.getTime() - purchaseDate.getTime();

      const diffDays =
        diffTime / (1000 * 60 * 60 * 24);

      if (diffDays >= 0 && diffDays <= 7) {
        this.weeklyRevenue += amount;
      }

      // 🔥 MONTHLY REVENUE
      const isCurrentMonth =
        purchaseDate.getMonth() === today.getMonth() &&
        purchaseDate.getFullYear() === today.getFullYear();

      if (isCurrentMonth) {
        this.monthlyRevenue += amount;
      }

      // 🔥 TOP SELLING
      topBooks[p.bookId] =
        (topBooks[p.bookId] || 0) + 1;

    });

    // 🔥 FIND TOP BOOK
    let max = 0;
    let topId: any = null;

    for (const id in topBooks) {

      if (topBooks[id] > max) {

        max = topBooks[id];
        topId = id;

      }

    }

    // 🔥 FIND BOOK
    const book = this.books.find(
      (b: any) =>
        b.id.toString() === topId?.toString()
    );

    this.topSellingBook =
      book?.title ||
      book?.name ||
      'No Data';

    this.topSellingCount = max;

    // 🔥 DEBUG LOGS
    console.log('TODAY:', this.todayRevenue);
    console.log('WEEKLY:', this.weeklyRevenue);
    console.log('MONTHLY:', this.monthlyRevenue);

  }

  // 🔥 GET BOOK NAME
  getBookName(id: string) {

    const book = this.books.find(
      b => b.id.toString() === id.toString()
    );

    return book
      ? (book.title || book.name)
      : 'Unknown';

  }

  // 🔥 GET BOOK AMOUNT
  getBookAmount(bookId: string) {

    const book = this.books.find(
      b => b.id.toString() === bookId.toString()
    );

    if (!book) return 0;

    // 🔥 ALWAYS TAKE ACTUAL BOOK PRICE
    return Number(book.price || 0);

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

  loadSubscriptions() {

    const headers = new HttpHeaders({

      Authorization: this.token

    });

    this.http.get<any[]>(

      `${this.api}/subscription/all`,

      { headers }

    )

      .subscribe({

        next: (res) => {

          this.subscriptions = res;

          console.log("Subscriptions", res);

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  // 🔓 LOGOUT
  logout() {

    this.isLoggedIn = false;

    this.token = '';

    this.password = '';

  }

  deleteSubscription(id: string) {

    if (!confirm("Delete Subscription?")) return;

    const headers = new HttpHeaders({

      Authorization: this.token

    });

    this.http.delete(

      `${this.api}/subscription/delete/${id}`,

      { headers }

    )

      .subscribe({

        next: () => {

          alert("Subscription Deleted ✅");

          this.loadSubscriptions();

        },

        error: (err) => {

          console.log(err);

          alert("Delete Failed");

        }

      });

  }

}