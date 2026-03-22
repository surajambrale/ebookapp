import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  pdfUrl!: SafeResourceUrl;
  user: any;
  apiUrl = environment.apiUrl;

  private keyListener: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {

    // 🔐 Disable shortcuts (save/print/view source)
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
    this.http.get(`${this.apiUrl}/check/${this.user._id}/${this.bookId}`)
      .subscribe({
        next: (res: any) => {

          if (res.access) {
            this.allowed = true;

            // 🔥 SECURE PDF URL (Render backend)
            const url = `${this.apiUrl}/book/${this.user._id}/${this.bookId}`;

            // 👉 ng2-pdf-viewer ke liye direct URL best hai
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

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

  // 🔓 LOGOUT
  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  // 🧹 CLEANUP (IMPORTANT)
  ngOnDestroy() {
    document.removeEventListener('keydown', this.keyListener);
  }
}