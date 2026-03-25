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
  isLoggedIn = false; // 🔥 default false
  token = '';
  

  users: any[] = [];
  purchases: any[] = [];

  api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🔐 CHECK LOGIN ON LOAD
  ngOnInit() {

    const savedToken = localStorage.getItem('adminToken');

    // 🔴 NO TOKEN → FORCE LOGIN SCREEN
    if (!savedToken) {
      this.isLoggedIn = false;
      return;
    }

    const headers = new HttpHeaders({
      Authorization: savedToken
    });

    // 🔐 VERIFY TOKEN FROM BACKEND
    this.http.get(`${this.api}/admin-verify`, { headers })
      .subscribe({
        next: () => {
          this.token = savedToken;
          this.isLoggedIn = true;
          this.loadData();
        },
        error: () => {
          this.logout(); // ❌ invalid token
        }
      });
  }

  // 🔐 LOGIN
  login() {
    
    const cleanPassword = this.password.trim();

    this.http.post(`${this.api}/admin-login`, { password: cleanPassword })
      .subscribe({
        next: (res: any) => {
          this.token = res.token;

          localStorage.setItem('adminToken', this.token);

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
  }

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

  // 🔓 LOGOUT
  logout() {
    localStorage.removeItem('adminToken');
    this.isLoggedIn = false;
    this.password = '';
    this.users = [];
    this.purchases = [];
  }

  getBookName(id: string) {
    if (id == '1') return 'Fat Loss Guide';
    return 'Unknown Book';
  }
}