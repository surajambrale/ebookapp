import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createOrder(couponCode: string = '') {
    return this.http.post<any>(
      `${this.api}/subscription/create-order`,
      { couponCode }
    );
  }

  verifyPayment(data: any) {
    return this.http.post<any>(
      `${this.api}/subscription/verify-payment`,
      data
    );
  }

  checkSubscription() {
    return this.http.get<any>(
      `${this.api}/subscription/status`
    );
  }
}
