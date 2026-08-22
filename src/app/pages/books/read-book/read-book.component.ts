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
  pdfUrl: string = '';
  private pdfObjectUrl = '';
  user: any;

  isLoading = true;

  // 🔥 NEW
  currentProgress = 0;

  private keyListener: any;
  private copyListener: any;
  private cutListener: any;
  private dragListener: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {

    // 🔥 DISABLE SHORTCUTS
    this.keyListener = (e: KeyboardEvent) => {

      if (
        e.ctrlKey &&
        ['s', 'p', 'u'].includes(
          e.key.toLowerCase()
        )
      ) {

        e.preventDefault();

      }

    };

    document.addEventListener(
      'keydown',
      this.keyListener
    );

    this.copyListener = (e: ClipboardEvent) => e.preventDefault();
    this.cutListener = (e: ClipboardEvent) => e.preventDefault();
    this.dragListener = (e: DragEvent) => e.preventDefault();
    document.addEventListener('copy', this.copyListener);
    document.addEventListener('cut', this.cutListener);
    document.addEventListener('dragstart', this.dragListener);

    this.user = this.auth.getUser();

    // 🔥 LOGIN CHECK
    if (!this.user || !this.user._id) {

      alert('Please login first ❌');

      this.router.navigate(['/login']);

      return;

    }

    this.bookId =
      this.route.snapshot.params['id'];

    // 🔥 CHECK ACCESS
    this.http.get(
      `${environment.apiUrl}/check/${this.user._id}/${this.bookId}`
    )
    .subscribe({

      next: (res: any) => {

        if (res.access) {

          this.allowed = true;

          this.http.get(
            `${environment.apiUrl}/book/${this.user._id}/${this.bookId}`,
            { responseType: 'blob' }
          ).subscribe({
            next: (pdf: Blob) => {
              this.pdfObjectUrl = URL.createObjectURL(pdf);
              this.pdfUrl = this.pdfObjectUrl;
              this.isLoading = false;
              this.trackReadingProgress();
            },
            error: () => {
              this.isLoading = false;
              alert('Unable to open this book. Your access may have expired.');
              this.router.navigate(['/my-books']);
            }
          });

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

  // 🔥 TRACK READING
  trackReadingProgress() {

    window.addEventListener(
      'scroll',
      this.handleScroll,
      true
    );

  }

  // 🔥 HANDLE SCROLL
  handleScroll = () => {

    const scrollTop =
      window.scrollY;

    const docHeight =
      document.body.scrollHeight -
      window.innerHeight;

    if (docHeight <= 0) return;

    const progress =
      Math.round(
        (scrollTop / docHeight) * 100
      );

    this.currentProgress = progress;

    // 🔥 SAVE PROGRESS
    localStorage.setItem(

      `progress_${this.user._id}_${this.bookId}`,

      progress.toString()

    );

  };

  logout() {

    this.auth.logout();

    this.router.navigate(['/']);

  }

  ngOnDestroy() {

    document.removeEventListener(
      'keydown',
      this.keyListener
    );
    document.removeEventListener('copy', this.copyListener);
    document.removeEventListener('cut', this.cutListener);
    document.removeEventListener('dragstart', this.dragListener);

    // 🔥 REMOVE SCROLL
    window.removeEventListener(
      'scroll',
      this.handleScroll,
      true
    );

    if (this.pdfObjectUrl) {
      URL.revokeObjectURL(this.pdfObjectUrl);
    }

  }

  // 🔥 GO BACK TO MY BOOKS
goBackToBooks() {

  this.router.navigate(['/my-books']);

}

}