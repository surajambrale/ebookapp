import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLinkActive,
  RouterLink
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  environment
} from '../../../environments/environment.prod';

declare var Razorpay: any;

@Component({
  selector: 'app-library-folder',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './library-folder.component.html',

  styleUrls: [
    './library-folder.component.scss'
  ]
})
export class LibraryFolderComponent implements OnInit {

  // =====================================
  // FOLDER DATA
  // =====================================

  folderId = '';

  folder: any = null;

  subFolders: any[] = [];

  contents: any[] = [];

  hasAccess = false;

  loading = true;

  // =====================================
  // CONSTRUCTOR
  // =====================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // =====================================
  // INIT
  // =====================================

  ngOnInit(): void {

    this.folderId =
      this.route.snapshot.paramMap.get('id') || '';

    if (!this.folderId) {

      this.goToLibrary();

      return;
    }

    this.loadFolder();
  }

  // =====================================
  // LOAD FOLDER
  // =====================================

  loadFolder(): void {

    this.loading = true;

    this.http.get<any>(
      `/api/folders/detail/${this.folderId}`
    )
    .subscribe({

      next: (res) => {

        console.log(
          '📂 FOLDER DETAIL:',
          res
        );

        // -------------------------------
        // FOLDER
        // -------------------------------

        this.folder =
          res?.folder || null;

        // -------------------------------
        // SUB FOLDERS
        // -------------------------------

        this.subFolders =
          res?.subFolders || [];

        // -------------------------------
        // CONTENT
        // -------------------------------

        this.contents =
          res?.contents || [];

        // -------------------------------
        // BACKEND ACCESS
        // -------------------------------

        this.hasAccess =
          res?.hasAccess === true;

        // -------------------------------
        // DEBUG PRICE
        // -------------------------------

        console.log(
          '💰 FOLDER PRICING:',
          {
            sellingPrice:
              this.folder?.sellingPrice,

            offerPrice:
              this.folder?.offerPrice,

            finalPrice:
              this.getFinalPrice()
          }
        );

        // -------------------------------
        // CHECK USER ACCESS
        // -------------------------------

        this.checkFolderAccess();

        this.loading = false;
      },

      error: (error) => {

        console.error(
          '❌ FOLDER LOAD ERROR:',
          error
        );

        this.loading = false;

        alert(
          error?.error?.message ||
          'Unable to load folder ❌'
        );

        this.goToLibrary();
      }

    });
  }

  // =====================================
  // GET SELLING PRICE
  // =====================================

  getSellingPrice(): number {

    return Number(
      this.folder?.sellingPrice || 0
    );
  }

  // =====================================
  // GET OFFER PRICE
  // =====================================

  getOfferPrice(): number {

    return Number(
      this.folder?.offerPrice || 0
    );
  }

  // =====================================
  // GET FINAL PRICE
  // =====================================

  getFinalPrice(): number {

    const sellingPrice =
      this.getSellingPrice();

    const offerPrice =
      this.getOfferPrice();

    // Offer valid only when
    // it is greater than 0
    // and lower than selling price

    if (
      offerPrice > 0 &&
      sellingPrice > 0 &&
      offerPrice < sellingPrice
    ) {

      return offerPrice;
    }

    return sellingPrice;
  }

  // =====================================
  // CHECK FOLDER ACCESS
  // =====================================

  checkFolderAccess(): void {

    const user =
      this.auth.getUser();

    // -------------------------------
    // USER NOT LOGGED IN
    // -------------------------------

    if (!user || !user._id) {

      this.hasAccess = false;

      return;
    }

    // -------------------------------
    // CHECK ACCESS API
    // -------------------------------

    this.http.get<any>(
      `/api/folder-access/check/${this.folderId}`
    )
    .subscribe({

      next: (res) => {

        this.hasAccess =
          res?.hasAccess === true;

        console.log(
          '🔐 FOLDER ACCESS:',
          {
            hasAccess: this.hasAccess,
            response: res
          }
        );

      },

      error: (error) => {

        console.error(
          '❌ FOLDER ACCESS CHECK ERROR:',
          error
        );

        this.hasAccess = false;
      }

    });
  }

  // =====================================
  // OPEN SUB FOLDER
  // =====================================

  openSubFolder(folder: any): void {

    if (!folder?._id) {

      console.error(
        'Invalid subfolder:',
        folder
      );

      return;
    }

    this.router.navigate([
      '/library/folder',
      folder._id
    ]);
  }

  // =====================================
  // OPEN CONTENT
  // =====================================

  openContent(content: any): void {

    // -------------------------------
    // NO ACCESS
    // -------------------------------

    if (!this.hasAccess) {

      this.buyFolder();

      return;
    }

    // -------------------------------
    // ACCESS GRANTED
    // -------------------------------

    console.log(
      '📚 OPEN CONTENT:',
      content
    );

    /*
      Yaha tumhara existing PDF /
      Video / Note opening logic rakho.

      Example:

      if (content.type === 'pdf') {
        ...
      }

      if (content.type === 'video') {
        ...
      }

      if (content.type === 'note') {
        ...
      }
    */
  }

  // =====================================
  // BUY FOLDER
  // =====================================

  buyFolder(): void {

    // =================================
    // LOGIN CHECK
    // =================================

    if (!this.auth.isLoggedIn()) {

      localStorage.setItem(
        'redirectAfterLogin',
        `/library/folder/${this.folderId}`
      );

      this.router.navigate([
        '/login'
      ]);

      return;
    }

    // =================================
    // USER
    // =================================

    const user =
      this.auth.getUser();

    if (!user || !user._id) {

      alert(
        'Please login again ❌'
      );

      this.router.navigate([
        '/login'
      ]);

      return;
    }

    // =================================
    // DYNAMIC PRICE
    // =================================

    const sellingPrice =
      this.getSellingPrice();

    const offerPrice =
      this.getOfferPrice();

    const finalPrice =
      this.getFinalPrice();

    // =================================
    // DEBUG
    // =================================

    console.log(
      '💰 PAYMENT PRICE:',
      {
        sellingPrice,
        offerPrice,
        finalPrice
      }
    );

    // =================================
    // PRICE VALIDATION
    // =================================

    if (
      !finalPrice ||
      finalPrice <= 0
    ) {

      alert(
        'Folder price is not available ❌'
      );

      return;
    }

    // =================================
    // CREATE RAZORPAY ORDER
    // =================================

    this.http.post<any>(
      `/create-order`,
      {
        amount: finalPrice
      }
    )
    .subscribe({

      next: (order) => {

        console.log(
          '📦 FOLDER ORDER:',
          order
        );

        // =================================
        // CHECK RAZORPAY
        // =================================

        if (
          typeof Razorpay === 'undefined'
        ) {

          console.error(
            'Razorpay script is not loaded'
          );

          alert(
            'Payment system is not loaded. Please refresh the page ❌'
          );

          return;
        }

        // =================================
        // RAZORPAY OPTIONS
        // =================================

        const options: any = {

          key:
            environment.razorpayKey,

          amount:
            order.amount,

          currency:
            order.currency || 'INR',

          name:
            'SS Builds',

          description:
            `Folder Access - ${this.folder?.name || 'Learning Folder'}`,

          order_id:
            order.id,

          // =================================
          // PAYMENT SUCCESS
          // =================================

          handler: (response: any) => {

            console.log(
              '💳 PAYMENT RESPONSE:',
              response
            );

            // =================================
            // VERIFY PAYMENT
            // =================================

            this.http.post<any>(
              `/verify-folder-payment`,
              {

                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,

                userId:
                  user._id,

                folderId:
                  this.folderId,

                amount:
                  finalPrice

              }
            )
            .subscribe({

              next: (verifyRes) => {

                console.log(
                  '✅ FOLDER PAYMENT VERIFIED:',
                  verifyRes
                );

                if (
                  verifyRes?.success
                ) {

                  alert(
                    'Folder unlocked successfully 🎉'
                  );

                  // -------------------------
                  // CHECK ACCESS AGAIN
                  // -------------------------

                  this.checkFolderAccess();

                  // -------------------------
                  // LOAD FOLDER AGAIN
                  // -------------------------

                  this.loadFolder();

                } else {

                  alert(
                    verifyRes?.message ||
                    'Payment verification failed ❌'
                  );
                }

              },

              error: (error) => {

                console.error(
                  '❌ FOLDER PAYMENT VERIFY ERROR:',
                  error
                );

                alert(
                  error?.error?.message ||
                  'Payment verification failed ❌'
                );

              }

            });

          },

          // =================================
          // PAYMENT FAILED
          // =================================

          modal: {

            ondismiss: () => {

              console.log(
                'Payment popup closed'
              );

            }

          },

          // =================================
          // PREFILL
          // =================================

          prefill: {

            name:
              user.name || '',

            contact:
              user.phone || ''

          },

          // =================================
          // THEME
          // =================================

          theme: {

            color:
              '#f5c542'

          }

        };

        // =================================
        // CREATE RAZORPAY INSTANCE
        // =================================

        const razorpay =
          new Razorpay(options);

        // =================================
        // PAYMENT FAILED EVENT
        // =================================

        razorpay.on(
          'payment.failed',
          (response: any) => {

            console.error(
              '❌ RAZORPAY PAYMENT FAILED:',
              response
            );

            alert(
              response?.error?.description ||
              'Payment failed ❌'
            );
          }
        );

        // =================================
        // OPEN RAZORPAY
        // =================================

        razorpay.open();

      },

      error: (error) => {

        console.error(
          '❌ CREATE FOLDER ORDER ERROR:',
          error
        );

        alert(
          error?.error?.message ||
          'Unable to create payment order ❌'
        );

      }

    });
  }

  // =====================================
  // BACK
  // =====================================

  goBack(): void {

    if (
      window.history.length > 1
    ) {

      window.history.back();

      return;
    }

    this.goToLibrary();
  }

  // =====================================
  // LIBRARY
  // =====================================

  goToLibrary(): void {

    this.router.navigate([
      '/library'
    ]);
  }

}