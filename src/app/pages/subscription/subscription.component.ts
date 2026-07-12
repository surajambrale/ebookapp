import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription',
  standalone: true,
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent {

  constructor(private router: Router) {}

  subscribe() {

    const token = localStorage.getItem('token');

    if (!token) {

      alert('Please login first');

      localStorage.setItem('redirectAfterLogin','subscription');

      this.router.navigate(['/login']);

      return;

    }

    alert("Next Step : Razorpay Payment");

  }

}