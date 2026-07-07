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
  user: any;

  isLoading = true;

  // 🔥 NEW
  currentProgress = 0;

  private keyListener: any;

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

          this.pdfUrl =
            `${environment.apiUrl}/book/${this.user._id}/${this.bookId}`;

          this.isLoading = false;

          // 🔥 START TRACKING
          this.trackReadingProgress();

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

    // 🔥 REMOVE SCROLL
    window.removeEventListener(
      'scroll',
      this.handleScroll,
      true
    );

  }

  // 🔥 GO BACK TO MY BOOKS
goBackToBooks() {

  this.router.navigate(['/my-books']);

}

}