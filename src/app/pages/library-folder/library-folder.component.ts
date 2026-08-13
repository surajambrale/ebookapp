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

  templateUrl:
    './library-folder.component.html',

  styleUrls: [
    './library-folder.component.scss'
  ]
})
export class LibraryFolderComponent
  implements OnInit {

  // =====================================
  // FOLDER DATA
  // =====================================

  folderId = '';

  folder: any = null;

  subFolders: any[] = [];

  contents: any[] = [];

  hasAccess = false;

  loading = true;

  buying = false;


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
          '📂 COMPLETE FOLDER RESPONSE:',
          res
        );


        // =================================
        // FOLDER
        // =================================

        this.folder = res?.folder || null;

console.log('📂 COMPLETE FOLDER:', this.folder);

console.log('💰 BACKEND PRICING:', res?.pricing);

        // =================================
        // SUB FOLDERS
        // =================================

        this.subFolders =
          Array.isArray(res?.subFolders)
            ? res.subFolders
            : [];


        // =================================
        // CONTENT
        // =================================

        this.contents =
          Array.isArray(res?.contents)
            ? res.contents
            : [];


        // =================================
        // BACKEND ACCESS
        // =================================

        this.hasAccess =
          res?.hasAccess === true;


        // =================================
        // DEBUG
        // =================================

        console.log(
          '📂 FOLDER OBJECT:',
          this.folder
        );

        console.log(
          '💰 SELLING PRICE:',
          this.folder?.sellingPrice
        );

        console.log(
          '🏷️ OFFER PRICE:',
          this.folder?.offerPrice
        );

        console.log(
          '💵 FINAL PRICE:',
          this.getFinalPrice()
        );


        // =================================
        // USER ACCESS
        // =================================

        this.checkFolderAccess();


        this.loading = false;
      },


      error: (error) => {

        console.error(
          '❌ FOLDER LOAD ERROR:',
          error
        );

        this.loading = false;


        this.goToLibrary();
      }

    });
  }


  // =====================================
  // SELLING PRICE
  // =====================================

  getSellingPrice(): number {

    if (!this.folder) {
      return 0;
    }

    const price =
      Number(
        this.folder.sellingPrice
      );

    return Number.isFinite(price)
      ? price
      : 0;
  }


  // =====================================
  // OFFER PRICE
  // =====================================

  getOfferPrice(): number {

    if (!this.folder) {
      return 0;
    }

    const price =
      Number(
        this.folder.offerPrice
      );

    return Number.isFinite(price)
      ? price
      : 0;
  }


  // =====================================
  // FINAL PRICE
  // =====================================

  getFinalPrice(): number {

    const sellingPrice =
      this.getSellingPrice();

    const offerPrice =
      this.getOfferPrice();


    // Offer valid only when:
    // offer > 0
    // offer < selling price

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


    // User not logged in
    if (
      !user ||
      !user._id
    ) {

      this.hasAccess = false;

      return;
    }


    this.http.get<any>(
      `/api/folder-access/check/${this.folderId}`
    )
    .subscribe({

      next: (res) => {

        this.hasAccess =
          res?.hasAccess === true;


        console.log(
          '🔐 FOLDER ACCESS:',
          res
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

  openSubFolder(
    folder: any
  ): void {

    if (!folder?._id) {

      console.error(
        '❌ Invalid subfolder:',
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

  openContent(
    content: any
  ): void {

    if (!this.hasAccess) {

      this.buyFolder();

      return;
    }


    console.log(
      '📚 OPEN CONTENT:',
      content
    );


    // =================================
    // YAHAN EXISTING CONTENT LOGIC
    // =================================

    /*
      PDF / VIDEO / NOTE opening logic
      yahan add karna hai.
    */
  }


  // =====================================
  // BUY FOLDER
  // =====================================

  buyFolder(): void {

    // Prevent double click
    if (this.buying) {
      return;
    }


    // =================================
    // LOGIN CHECK
    // =================================

    if (
      !this.auth.isLoggedIn()
    ) {

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


    if (
      !user ||
      !user._id
    ) {

      alert(
        'Please login again ❌'
      );


      this.router.navigate([
        '/login'
      ]);

      return;
    }


    // =================================
    // PRICE
    // =================================

    const sellingPrice =
      this.getSellingPrice();

    const offerPrice =
      this.getOfferPrice();

    const finalPrice =
      this.getFinalPrice();


    console.log(
      '💰 PAYMENT PRICE:',
      {
        folderId: this.folderId,
        sellingPrice,
        offerPrice,
        finalPrice,
        folder: this.folder
      }
    );


    // =================================
    // PRICE VALIDATION
    // =================================

    if (
      finalPrice <= 0
    ) {

      console.error(
        '❌ INVALID FOLDER PRICE',
        {
          folder: this.folder,
          sellingPrice,
          offerPrice,
          finalPrice
        }
      );


      alert(
        'Folder price is not available ❌'
      );

      return;
    }


    this.buying = true;


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
          '📦 RAZORPAY ORDER:',
          order
        );


        // =================================
        // CHECK RAZORPAY SCRIPT
        // =================================

        if (
          typeof Razorpay === 'undefined'
        ) {

          this.buying = false;


          console.error(
            '❌ Razorpay script not loaded'
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
            `Folder Access - ${
              this.folder?.name ||
              'Learning Folder'
            }`,

          order_id:
            order.id,


          // =================================
          // PAYMENT SUCCESS
          // =================================

          handler:
            (response: any) => {

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

                next:
                  (verifyRes) => {

                    console.log(
                      '✅ PAYMENT VERIFIED:',
                      verifyRes
                    );


                    if (
                      verifyRes?.success
                    ) {

                      alert(
                        'Folder unlocked successfully 🎉'
                      );


                      this.buying = false;


                      // Reload folder
                      this.loadFolder();

                    }
                    else {

                      this.buying = false;


                      alert(
                        verifyRes?.message ||
                        'Payment verification failed ❌'
                      );
                    }

                  },


                error:
                  (error) => {

                    this.buying = false;


                    console.error(
                      '❌ PAYMENT VERIFY ERROR:',
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
          // PAYMENT CLOSED
          // =================================

          modal: {

            ondismiss: () => {

              this.buying = false;

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
        // RAZORPAY INSTANCE
        // =================================

        const razorpay =
          new Razorpay(options);


        // =================================
        // PAYMENT FAILED
        // =================================

        razorpay.on(
          'payment.failed',
          (response: any) => {

            this.buying = false;


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
        // OPEN
        // =================================

        razorpay.open();
      },


      error: (error) => {

        this.buying = false;


        console.error(
          '❌ CREATE ORDER ERROR:',
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