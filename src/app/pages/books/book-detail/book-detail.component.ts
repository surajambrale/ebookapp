import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent {

  book: any;
  hasAccess: boolean = false;

  isLoading: boolean = false; // 🔥 single loader use
  apiUrl = environment.apiUrl;

  // 🔥 SLIDER
  currentImageIndex = 0;

  dynamicBooks: any[] = [];


  books = [
    // {
    //   id: 1,
    //   title: "Complete Fat Loss Guide",
    //   author: "Suraj Ambrale - Nutritionist | Fitness Trainer",
    //   price: 49,
    //   reviews: 24,
    //   image: "assets/images/fatloss-book.jpeg",
    //   previewImages: [
    //     "assets/preview-img/fatloss1.jpeg",
    //     "assets/preview-img/fatloss2.jpeg",
    //     "assets/preview-img/fatloss3.jpeg"
    //   ],
    //   description: "Welcome to the Complete Fitness & Nutrition program. This program is specially designed for beginners and normal individuals who want to improve overall health, loose excess body fat, increase strength, and build a sustainable fitness lifestyle. The purpose of this kit is to simplify fitness and nutrition. No extreme workouts, no crash diets, and no complicated rules. This program focuses on consistency, balance, and long-term results."
    // },
 
    {
      id: 7,
      title: "Admin Testing",
      author: "Admin Testing",
      price: 1,
      reviews: 19,
      image: "assets/images/admin-testing-book.jpg",
      description: "Admin Testing Book, don't buy this book."
    }
  ];

  loadDynamicBooks() {

    this.http.get<any[]>(`${this.apiUrl}/books/all`)
      .subscribe({

        next: (res) => {

          this.dynamicBooks = res;

          this.loadBook();

        },

        error: () => {

          this.loadBook();

        }

      });

  }

  loadBook() {

    const id = this.route.snapshot.params['id'];

    // First check dynamic books
    this.book = this.dynamicBooks.find(
      (b: any) => b._id == id
    );

    // Otherwise hardcoded books
    if (!this.book) {

      this.book = this.books.find(
        b => b.id == id
      );

    }

    if (!this.book) {

      alert("Book not found");

      this.router.navigate(['/']);

      return;

    }

    const user = this.auth.getUser();

    if (user && user._id) {

      const bookId = this.book._id || this.book.id;

      this.http.get(
        `${this.apiUrl}/check/${user._id}/${bookId}`
      )

        .subscribe({

          next: (res: any) => {

            this.hasAccess = res.access;

          }

        });

    }

  }



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit() {

  this.loadDynamicBooks();

}

  //slider function start

  // 🔥 SLIDER FUNCTIONS
  nextImage() {
    if (!this.book?.previewImages) return;
    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.book.previewImages.length;
  }

  prevImage() {
    if (!this.book?.previewImages) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.book.previewImages.length) %
      this.book.previewImages.length;
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
  }

  // 🔥 SWIPE VARIABLES
  touchStartX: number = 0;
  touchEndX: number = 0;

  // 👉 swipe start
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  // 👉 swipe end
  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  // 👉 detect direction
  handleSwipe() {
    const swipeDistance = this.touchEndX - this.touchStartX;

    // 👉 sensitivity (50px swipe required)
    if (swipeDistance > 50) {
      this.prevImage(); // swipe right → previous
    } else if (swipeDistance < -50) {
      this.nextImage(); // swipe left → next
    }
  }

  //slider function end

  // 💳 BUY BOOK
  buyBook() {

    // 🔴 NOT LOGGED IN → LOGIN PAGE
    if (!this.auth.isLoggedIn()) {

      // 🔥 redirect after login
      localStorage.setItem('redirectAfterLogin', `/book/${this.book.id}`);

      this.router.navigate(['/login']);
      return;
    }

    const user = this.auth.getUser();

    if (!user || !user._id) {
      alert('Please login again ❌');
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;

    // 🧾 CREATE ORDER
    this.http.post(`${this.apiUrl}/create-order`, {
      amount: this.book.price
    }).subscribe({

      next: (order: any) => {

        const options: any = {
          // key: "rzp_test_STqAGoxV34Jsne", // 🔴 testing key
          key: "rzp_live_SWeBwjvwGx2bSP",  //live keyy
          amount: order.amount,
          currency: "INR",
          name: "SS Builds",
          description: this.book.title,
          order_id: order.id,

          handler: (response: any) => {

            // 🔐 VERIFY PAYMENT
            this.http.post(`${this.apiUrl}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              bookId: (this.book._id || this.book.id).toString(),
              amount: this.book.price
            }).subscribe({

              next: () => {

                this.isLoading = false;

                alert('Payment Successful 🎉');

                this.hasAccess = true;

                this.router.navigate([
                  '/read',
                  this.book._id || this.book.id
                ]);
              },

              error: () => {
                this.isLoading = false;
                alert('Payment verification failed ❌');
              }
            });
          },

          modal: {
            ondismiss: () => {
              this.isLoading = false;
              console.log('Payment closed');
            }
          },

          prefill: {
            name: user.name,
            contact: user.phone
          },

          theme: {
            color: "#0f172a"
          }
        };

        const rzp = new (window as any).Razorpay(options);
        this.isLoading = false;
        rzp.open();
      },

      error: () => {
        this.isLoading = false;
        alert('Order creation failed ❌');
      }
    });
  }

  // dynamic book code start



  // dynamic book code end

  // 📖 READ BOOK
  readBook() {

    if (!this.hasAccess) {
      alert('Please purchase the book first ❌');
      return;
    }

    this.router.navigate([
      '/read',
      this.book._id || this.book.id
    ]);
  }
}