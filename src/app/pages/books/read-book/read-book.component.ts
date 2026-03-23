import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-read-book',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './read-book.component.html',
  styleUrls: ['./read-book.component.scss']
})
export class ReadBookComponent implements OnDestroy {

  bookId: any;
  allowed = false;
  pdfUrl: string = '';   // ✅ STRING रखना है (IMPORTANT)
  user: any;

  private keyListener: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private http: HttpClient
  ) {}
isLoading = true;

  ngOnInit() {

    // 🔐 Disable shortcuts
    this.keyListener = (e: KeyboardEvent) => {
      if (e.ctrlKey && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', this.keyListener);

    this.user = this.auth.getUser();

    // ❌ NOT LOGGED IN
    if (!this.user || !this.user._id) {
      alert('Please login first ❌');
      this.router.navigate(['/login']);
      return;
    }

    this.bookId = this.route.snapshot.params['id'];

    // 🔐 CHECK ACCESS
    this.http.get(`${environment.apiUrl}/check/${this.user._id}/${this.bookId}`)
      .subscribe({
        next: (res: any) => {

          if (res.access) {
            this.allowed = true;

            // 🔥 DIRECT URL (NO SANITIZER)
            this.pdfUrl = `${environment.apiUrl}/book/${this.user._id}/${this.bookId}`;

            console.log("PDF URL 👉", this.pdfUrl); // debug
            this.isLoading = false; // 🔥 STOP LOADER
          } else {
            alert('Access Denied ❌');
            this.router.navigate(['/']);
          }

        },
        error: () => {
          alert('Server error ❌');
          this.router.navigate(['/']);
        }
      });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keyListener);
  }
}