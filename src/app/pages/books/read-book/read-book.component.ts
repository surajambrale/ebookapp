import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-read-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './read-book.component.html',
  styleUrls: ['./read-book.component.scss']
})
export class ReadBookComponent {

  bookId: any;
  allowed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const user = this.auth.getUser();

    if (!user || !user._id) {
      this.router.navigate(['/login']);
      return;
    }

    this.bookId = this.route.snapshot.params['id'];

    // 🔐 FINAL SECURITY CHECK
    this.http.get(`http://localhost:5000/check/${user._id}/${this.bookId}`)
      .subscribe((res: any) => {

        if (res.access) {
          this.allowed = true;
        } else {
          alert('Access Denied ❌');
          this.router.navigate(['/']);
        }

      });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}