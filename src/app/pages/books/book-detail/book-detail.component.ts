import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent {

  book: any;
  hasAccess: boolean = false;

  isLoading: boolean = false; // 🔥 single loader use
  apiUrl = environment.apiUrl;
  couponCode = '';

  discount = 0;

  finalPrice = 0;

  couponApplied = false;

  // 🔥 SLIDER
  currentImageIndex = 0;

  dynamicBooks: any[] = [];

  books: any[] = [];




  loadDynamicBooks() {

  this.http.get<any>(`${this.apiUrl}/books/all`)
    .subscribe({

      next: (res) => {

        this.dynamicBooks = res.books || [];

        console.log("Dynamic Books:", this.dynamicBooks);

        this.loadBook();

      },

      error: (err) => {

        console.log(err);

        this.dynamicBooks = [];

        this.loadBook();

      }

    });

}

  loadBook() {

  const id = this.route.snapshot.params['id'];

  // 👇 API se book load karo
  this.http.get<any>(`${this.apiUrl}/books/${id}`)
    .subscribe({

      next: (book) => {

        this.book = book;

        this.finalPrice = book.price;

        const user = this.auth.getUser();

        if (user && user._id) {

          this.http.get<any>(
            `${this.apiUrl}/check/${user._id}/${book._id}`
          ).subscribe({

            next: (res) => {

              this.hasAccess = res.access;

            },

            error: (err) => {

              console.log(err);

            }

          });

        }

      },

      error: (err) => {

        console.log(err);

        alert("Book not found");

        this.router.navigate(['/']);

      }

    });

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

     // free book code start

       // ⭐⭐⭐ FREE BOOK (100% Coupon) ⭐⭐⭐
  if (this.finalPrice <= 0) {

    this.isLoading = true;

    this.http.post(`${this.apiUrl}/free-book`, {

      userId: user._id,
      bookId: this.book._id || this.book.id

    }).subscribe({

      next: () => {

        this.isLoading = false;

        alert("Book Added Successfully 🎉");

        this.hasAccess = true;

        this.router.navigate([
          '/read',
          this.book._id || this.book.id
        ]);

      },

      error: () => {

        this.isLoading = false;

        alert("Something went wrong ❌");

      }

    });

    return; // 👈 Razorpay nahi chalega

  }

    

    // free book code end

    this.isLoading = true;

    console.log("Book Price:", this.book.price);
    console.log("Final Price:", this.finalPrice);
    console.log("Coupon Applied:", this.couponApplied);

    // 🧾 CREATE ORDER
    this.http.post(`${this.apiUrl}/create-order`, {
      amount: this.finalPrice
    }).subscribe({

      next: (order: any) => {

        const options: any = {
          // key: "rzp_test_STqAGoxV34Jsne", // 🔴 testing key
          key: environment.razorpayKey,  //live keyy
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
              amount: this.finalPrice
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

  // apply coupn code start

  applyCoupon() {

    if (!this.couponCode.trim()) {

      alert("Enter Coupon Code");

      return;

    }

    this.http.post<any>(`${this.apiUrl}/coupon/verify`, {

      code: this.couponCode,

      amount: this.book.price

    })

      .subscribe({

        next: (res) => {

          if (!res.success) {

            alert(res.message);

            return;

          }

          this.discount = res.discount;

          this.finalPrice = Number(res.finalPrice);

          this.couponApplied = true;

          alert("Coupon Applied Successfully 🎉");

        },

        error: () => {

          alert("Coupon Verification Failed");

        }

      });

  }

  // apply coupn code end

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