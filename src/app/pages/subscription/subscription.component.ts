import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var Razorpay:any;

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  API = environment.apiUrl;

  couponCode = '';
  couponDiscount = 0;
  couponFinalPrice: number | null = null;
  couponApplied = false;
  couponMessage = '';

  subscriptionSetting = {

  planName: "Premium Membership",

  offerPrice: 0,

  price: 99,

  duration: 30,

  active: true

};

  constructor(
    private http:HttpClient,
    private router:Router
  ){}

  ngOnInit() {

  this.loadSubscriptionSetting();

}

  subscribe(){

    const token=localStorage.getItem('token');

    if(!token){

      alert("Please Login First");

      localStorage.setItem(
        "redirectAfterLogin",
        "subscription"
      );

      this.router.navigate(['/login']);

      return;

    }

    const user=JSON.parse(
      localStorage.getItem("user")!
    );

    this.http.post<any>(

      `${this.API}/subscription/create-order`,

      {

        userId:user._id

      }

    ).subscribe({

      next:(res)=>{

        if(res.alreadySubscribed){
          alert("Subscription Already Active");
          return;
        }

        if (res.free) {
          alert('Subscription Activated Successfully 🎉');
          this.router.navigate(['/my-books']);
          return;
        }

        this.openRazorpay(res.order,user);

      },

      error:(err)=>{

        console.log(err);

      }

    });

  }

  openRazorpay(order:any,user:any){

    const options={


      key : environment.razorpayKey,

      amount:order.amount,

      currency:"INR",

      name:"SS Builds",

      description:"Monthly Subscription",

      order_id:order.id,

      handler:(response:any)=>{

        this.verifyPayment(response,user);

      },

      prefill:{

        name:user.name

      },

      theme:{

        color:"#4CAF50"

      }

    };

    const rzp=new Razorpay(options);

    rzp.open();

  }

  verifyPayment(response:any,user:any){

    this.http.post(

      `${this.API}/subscription/verify-payment`,

      {

        razorpay_order_id:response.razorpay_order_id,

        razorpay_payment_id:response.razorpay_payment_id,

        razorpay_signature:response.razorpay_signature,

        couponCode: this.couponApplied
          ? this.couponCode.trim().toUpperCase()
          : ''

      }

    ).subscribe({

      next:(res:any)=>{

        alert("Subscription Activated Successfully");

        this.router.navigate(['/my-books']);

      },

      error:(err)=>{

        console.log(err);

      }

    });

  }

  applyCoupon() {
    const code = this.couponCode.trim().toUpperCase();
    if (!code) {
      this.couponMessage = 'Enter coupon code';
      return;
    }

    const basePrice = Number(this.subscriptionSetting.offerPrice) > 0 &&
      Number(this.subscriptionSetting.offerPrice) < Number(this.subscriptionSetting.price)
      ? Number(this.subscriptionSetting.offerPrice)
      : Number(this.subscriptionSetting.price);

    this.http.post<any>(`${this.API}/coupon/verify`, {
      code,
      amount: basePrice
    }).subscribe({
      next: (res) => {
        if (!res?.success) {
          this.couponApplied = false;
          this.couponDiscount = 0;
          this.couponFinalPrice = null;
          this.couponMessage = res?.message || 'Invalid Coupon';
          return;
        }

        this.couponApplied = true;
        this.couponDiscount = Number(res.discount || 0);
        this.couponFinalPrice = Number(res.finalPrice || 0);
        this.couponMessage = `Coupon applied. You save ₹${this.couponDiscount}`;
      },
      error: (err) => {
        this.couponApplied = false;
        this.couponMessage = err?.error?.message || 'Coupon verification failed';
      }
    });
  }

  loadSubscriptionSetting() {

  this.http.get<any>(

    `${this.API}/subscription-setting`

  ).subscribe({

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

}