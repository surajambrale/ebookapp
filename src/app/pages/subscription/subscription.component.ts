import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare var Razorpay:any;

@Component({
  selector: 'app-subscription',
  standalone: true,
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent {

  API="http://localhost:5000";

  constructor(
    private http:HttpClient,
    private router:Router
  ){}

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

        this.openRazorpay(res.order,user);

      },

      error:(err)=>{

        console.log(err);

      }

    });

  }

  openRazorpay(order:any,user:any){

    const options={

      key:"rzp_live_SWeBwjvwGx2bSP",

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

        userId:user._id

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

}