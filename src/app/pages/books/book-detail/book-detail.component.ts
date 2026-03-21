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

  // 🔥 FINAL PAYMENT FLOW
  buyBook() {

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.auth.getUser();

    // 1️⃣ Create order from backend
    this.http.post('http://localhost:5000/create-order', {
      amount: this.book.price
    }).subscribe((order: any) => {

      const options: any = {
        key: "rzp_test_STqAGoxV34Jsne", // 🔴 CHANGE THIS
        amount: order.amount,
        currency: "INR",
        name: "SS Builds",
        description: this.book.title,
        order_id: order.id,

        handler: (response: any) => {

          // 2️⃣ VERIFY PAYMENT FROM BACKEND
          this.http.post('http://localhost:5000/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId: user._id,
            bookId: this.book.id.toString()
          }).subscribe(() => {

            alert('Payment Successful 🎉');

            // 🔥 AUTO REDIRECT
            this.router.navigate(['/read', this.book.id]);

          }, () => {
            alert('Payment verification failed ❌');
          });
        },

        prefill: {
          name: user.name,
          contact: user.phone
        },

        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    }, () => {
      alert('Order creation failed ❌');
    });
  }
}