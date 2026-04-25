import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login() {

    const cleanPassword = this.password.trim();

    this.http.post(`${this.api}/admin-login`, { password: cleanPassword })
      .subscribe({
        next: (res: any) => {
          this.token = res.token;
          this.isLoggedIn = true;
          this.loadData();
        },
        error: () => alert('Wrong password ❌')
      });
  }

  // 📊 LOAD DATA
  loadData() {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.get(`${this.api}/admin/users`, { headers })
      .subscribe((res: any) => this.users = res);

    this.http.get(`${this.api}/admin/purchases`, { headers })
      .subscribe((res: any) => this.purchases = res);

      this.http.get(`${this.api}/admin/books`, { headers })
      .subscribe((res: any) => this.books = res);
  }

   // 🔥 CENTRAL ACCESS CONTROL
  grantAccess() {

    if (!this.selectedUser || !this.selectedBook) {
      alert('Select user & book ❌');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.post(`${this.api}/admin/grant-access`, {
      userId: this.selectedUser,
      bookId: this.selectedBook
    }, { headers }).subscribe({
      next: () => {
        alert('Access granted ✅');
        this.loadData();
      },
      error: (err) => {
        alert(err.error.message || 'Error ❌');
      }
    });
  }

  // 🔥 CENTRAL ACCESS CONTROL

  // ❌ DELETE USER
  deleteUser(id: string) {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.delete(`${this.api}/admin/user/${id}`, { headers })
      .subscribe(() => {
        alert('User deleted ✅');
        this.loadData();
      });
  }

  // ❌ DELETE PURCHASE
  deletePurchase(id: string) {

    const headers = new HttpHeaders({
      Authorization: this.token
    });

    this.http.delete(`${this.api}/admin/purchase/${id}`, { headers })
      .subscribe(() => {
        alert('Purchase deleted ✅');
        this.loadData();
      });
  }

  // 🔓 LOGOUT (🔥 FORCE PASSWORD AGAIN)
  logout() {
    this.isLoggedIn = false;
    this.token = '';
    this.password = '';
    this.users = [];
    this.purchases = [];
  }

  getBookName(id: string) {
  const book = this.books.find(b => b.id.toString() === id.toString());
  return book ? book.name : 'Unknown';
}
}