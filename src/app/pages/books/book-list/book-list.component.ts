import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent {
  api = environment.apiUrl;
  dynamicCategories: string[] = [];

  constructor(private router: Router,
    private http: HttpClient
  ) { }

  subscriptionActive = false;

  subscriptionSetting: any = {
    planName: '',
    price: 99,
    duration: 30,
    active: true
  };

  books: any[] = [];

    // 🔥 FILTERED BOOKS
  filteredBooks: any[] = [];

  currentPage = 1;
  totalPages = 1;
  limit = 10;



  subscribeNow() {

    if (this.subscriptionActive) {

      alert("Your Subscription is Active ✅");

      return;

    }

    const token = localStorage.getItem('token');

    if (!token) {

      alert('Please login first.');

      this.router.navigate(['/login']);

      return;

    }

    this.router.navigate(['/subscription']);

  }


  //  dynamic book code start
  loadBooks(page: number = 1) {

    this.http.get<any>(
      `${this.api}/books/all?page=${page}&limit=${this.limit}`
    )
      .subscribe({

        next: (res) => {

          this.books = res.books;

          this.filteredBooks = res.books;

          this.currentPage = res.currentPage;

          this.totalPages = res.totalPages;

          this.dynamicCategories = [
            ...new Set(
              (res.books as any[])
                .map(book => book.category)
                .filter(category => !!category)
            )
          ];

        },

        error: (err) => {

          console.log(err);

        }

      });

  }


  // dynamic book code end

  //pagination code start

nextPage() {

  if (this.currentPage < this.totalPages) {

    this.loadBooks(this.currentPage + 1);

  }

}

previousPage() {

  if (this.currentPage > 1) {

    this.loadBooks(this.currentPage - 1);

  }

}

goToPage(page: number) {

  this.loadBooks(page);

}


get pages(): number[] {

  const pages: number[] = [];

  const start = Math.max(1, this.currentPage - 2);

  const end = Math.min(this.totalPages, this.currentPage + 2);

  for (let i = start; i <= end; i++) {

    pages.push(i);

  }

  return pages;

}

//pagination code end





  // 🔥 ON INIT
  ngOnInit() {
    this.filteredBooks = this.books;

    this.loadBooks();



    // 🔥 LOAD TESTIMONIALS
    this.loadTestimonials();


    this.checkSubscription();

    this.loadSubscriptionSetting();

  }


  loadSubscriptionSetting() {

    this.http.get<any>(`${this.api}/subscription-setting`)
      .subscribe({

        next: (res) => {

          if (res) {

            this.subscriptionSetting = res;

          }

        },

        error: (err) => {

          console.log(err);

        }

      });

  }


  // 🔥 OPEN BOOK
  openBook(id: any) {
    this.router.navigate(['/book', id]);
  }



  // 🔥 CATEGORY FILTER
  filterCategory(category: string) {

    this.filteredBooks = this.books.filter(
      (book: any) => book.category === category
    );

  }



  // 🔥 SHOW ALL BOOKS
  showAllBooks() {
    this.filteredBooks = this.books;
  }

  checkSubscription() {

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) return;

    this.http.get<any>(
      `${this.api}/subscription/status/${user._id}`
    ).subscribe({

      next: (res) => {

        this.subscriptionActive = res.subscribed;

      },

      error: (err) => {

        console.log(err);

      }

    });

  }



  //testimonial code start

  // 🔥 TESTIMONIAL FORM
  testimonialName = '';
  testimonialMessage = '';
  testimonialRating = 5;

  // 🔥 TESTIMONIAL LIST
  testimonials: any[] = [];

  // 🔥 LOAD TESTIMONIALS
  loadTestimonials() {

    this.http.get(`${this.api}/testimonials`)
      .subscribe({

        next: (res: any) => {

          this.testimonials = res;

        },

        error: (err) => {

          console.log(err);

        }

      });

  }

  // 🔥 SUBMIT TESTIMONIAL
  submitTestimonial() {

    if (
      !this.testimonialName ||
      !this.testimonialMessage
    ) {

      alert('Please fill all fields ❌');
      return;

    }

    this.http.post(`${this.api}/testimonial`, {

      name: this.testimonialName,

      message: this.testimonialMessage,

      rating: this.testimonialRating

    })

      .subscribe({

        next: () => {

          alert('Feedback Submitted ✅');

          // RESET
          this.testimonialName = '';
          this.testimonialMessage = '';
          this.testimonialRating = 5;

          // RELOAD
          this.loadTestimonials();

        },

        error: () => {

          alert('Error submitting feedback ❌');

        }

      });

  }


  // 🔥 TESTIMONIAL robot code

  scrollToTestimonial() {

    const section =
      document.getElementById(
        'testimonial-section'
      );

    if (section) {

      section.scrollIntoView({

        behavior: 'smooth'

      });

    }

  }

  //testimonial code end

  //Ai bot start


  isBotOpen = false;

  messages: any[] = [
    {
      text: '👋 Welcome to Fitness Assistant',
      type: 'bot'
    },
    {
      text: 'Are you Male or Female?',
      type: 'bot'
    }
  ];

  step = 1;

  userInput = '';

  gender = '';
  age: any;
  weight: any;
  height: any;

  goal = 'fatloss';

  toggleBot() {
    this.isBotOpen = !this.isBotOpen;
  }

  nextStep() {

    // 🔥 USER MESSAGE SHOW
    if (this.userInput) {
      this.messages.push({
        text: this.userInput,
        type: 'user'
      });
    }

    // STEP 1
    if (this.step === 1) {

      this.gender = this.userInput;

      this.messages.push({
        text: 'Enter your age',
        type: 'bot'
      });

      this.userInput = '';
      this.step++;
    }

    // STEP 2
    else if (this.step === 2) {

      this.age = Number(this.userInput);

      this.messages.push({
        text: 'Enter your weight in KG',
        type: 'bot'
      });

      this.userInput = '';
      this.step++;
    }

    // STEP 3
    else if (this.step === 3) {

      this.weight = Number(this.userInput);

      this.messages.push({
        text: 'Enter your height in CM',
        type: 'bot'
      });

      this.userInput = '';
      this.step++;
    }

    // STEP 4
    else if (this.step === 4) {

      this.height = Number(this.userInput);

      this.messages.push({
        text: 'Select your goal below',
        type: 'bot'
      });

      this.userInput = '';
      this.step++;
    }

    // STEP 5
    else if (this.step === 5) {

      let calories = 0;

      // MAINTENANCE CALORIES
      if (this.gender.toLowerCase() === 'male') {

        calories =
          (10 * this.weight) +
          (6.25 * this.height) -
          (5 * this.age) + 5;

      } else {

        calories =
          (10 * this.weight) +
          (6.25 * this.height) -
          (5 * this.age) - 161;
      }

      calories = calories * 1.55;

      let targetCalories = calories;

      if (this.goal === 'fatloss') {
        targetCalories = calories - 400;
      }

      if (this.goal === 'musclegain') {
        targetCalories = calories + 300;
      }

      this.messages.push({
        text: `🔥 Maintenance Calories: ${Math.round(calories)}`,
        type: 'bot'
      });

      this.messages.push({
        text: `🎯 Goal Calories: ${Math.round(targetCalories)}`,
        type: 'bot'
      });

      this.messages.push({
        text: `📞 Need Personal Training?\nContact Coach: 9372336433`,
        type: 'bot'
      });

      this.messages.push({
        text: `✅ Thank You`,
        type: 'bot'
      });

      this.step++;
    }

  }

  //Ai bot end

  // 🔥 BOTTOM NAVIGATION

  goHome() {
    this.router.navigate(['/']);
  }

  goExplore() {
    this.router.navigate(['/explore']);
  }

  goMyBooks() {
    this.router.navigate(['/my-books']);
  }

  goProfile() {
    this.router.navigate(['/profile']);
  }
}

