import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createOrder(userId:any){
    return this.http.post<any>(
      `${this.api}/subscription/create-order`,
      { userId }
    );
  }

  verifyPayment(data:any){
    return this.http.post<any>(
      `${this.api}/subscription/verify-payment`,
      data
    );
  }

  checkSubscription(userId:any){
    return this.http.get<any>(
      `${this.api}/subscription/check/${userId}`
    );
  }

}