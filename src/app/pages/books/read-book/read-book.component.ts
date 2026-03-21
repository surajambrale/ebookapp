import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-read-book',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './read-book.component.html',
  styleUrls: ['./read-book.component.scss']
})
export class ReadBookComponent {

  bookId: any;
  allowed = false;
  pdfUrl: any;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {

    // 🔐 Disable shortcuts
    document.addEventListener('keydown', (e: any) => {
      if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
        e.preventDefault();
      }
    });

    this.user = this.auth.getUser();

    if (!this.user || !this.user._id) {
      this.router.navigate(['/login']);
      return;
    }

    this.bookId = this.route.snapshot.params['id'];

    // 🔐 CHECK ACCESS
    this.http.get(`http://localhost:5000/check/${this.user._id}/${this.bookId}`)
      .subscribe((res: any) => {

        if (res.access) {
          this.allowed = true;

          // 🔥 SECURE BACKEND PDF URL
          // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          //   `http://localhost:5000/book/${this.user._id}/${this.bookId}`
          // );
          this.pdfUrl = `http://localhost:5000/book/${this.user._id}/${this.bookId}`;

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