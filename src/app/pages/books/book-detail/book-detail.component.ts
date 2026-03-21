import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent {

  book: any;

  books = [
    {
      id: 1,
      title: "Complete Fat Loss Guide",
      author: "Maya Alden",
      price: 449,
      reviews: 19,
      image: "assets/images/fatloss-book.jpeg",
      description: "Romantic emotional story..."
    },
    {
      id: 2,
      title: "Law Maker",
      author: "Susie Tate",
      price: 299,
      reviews: 6505,
      image: "assets/images/fatloss-book.jpeg",
      description: "Legal drama and romance..."
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.book = this.books.find(b => b.id == id);
  }

 buyBook() {
  if (!this.auth.isLoggedIn()) {
    this.router.navigate(['/login']);
    return;
  }

  // Razorpay link open
  window.open('https://razorpay.me/@surajsandeepambrale', '_blank');

  // Payment ke baad save (simple approach)
  // setTimeout(() => {
  //   const user = this.auth.getUser();

  //   this.http.post('http://localhost:5000/purchase', {
  //     userId: user._id,
  //     bookId: this.book.id
  //   }).subscribe(() => {
  //     alert('Payment Done!');
  //     this.router.navigate(['/read', this.book.id]);
  //   });

  // }, 5000);
}

verifyPayment() {
  const user = this.auth.getUser();

   console.log("USER 👉", user); // 🔥 DEBUG

  // ❗ SAFETY CHECK
  if (!user || !user._id) {
    alert('User not found, please login again');
    this.router.navigate(['/login']);
    return;
  }

  this.http.post('http://localhost:5000/purchase', {
    userId: user._id,
    bookId: this.book.id
  }).subscribe({
    next: (res) => {
      alert('Payment Verified ✅');
      this.router.navigate(['/read', this.book.id]);
    },
    error: (err) => {
      console.error(err);
      alert('Something went wrong');
    }
  });
}
}




