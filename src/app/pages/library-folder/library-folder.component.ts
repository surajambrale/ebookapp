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

  folderId = '';

  folder: any = null;

  subFolders: any[] = [];

  contents: any[] = [];

  hasAccess = false;

  loading = true;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}


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

        this.folder =
          res.folder || null;

        this.subFolders =
          res.subFolders || [];

        this.contents =
          res.contents || [];

        this.hasAccess =
          res.hasAccess === true;

        /*
         * 🔥 IMPORTANT
         * Login user ka actual folder access
         * bhi check karo.
         */
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
          'Unable to load folder'
        );

        this.goToLibrary();
      }

    });
  }


  // =====================================
  // CHECK FOLDER ACCESS
  // =====================================

  checkFolderAccess(): void {

    const user =
      this.auth.getUser();

    if (!user || !user._id) {

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
          this.hasAccess
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

    if (!this.hasAccess) {

      this.buyFolder();

      return;
    }

    console.log(
      '📚 OPEN CONTENT:',
      content
    );

    /*
      Yahan tumhara existing
      PDF / Video / Note opening logic
      rahega.

      Existing content logic ko yahan
      paste kar sakte ho.
    */
  }


  // =====================================
  // BUY FOLDER
  // =====================================

  buyFolder(): void {

    // =====================================
    // 🔐 LOGIN CHECK
    // =====================================

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


    // =====================================
    // 👤 USER
    // =====================================

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


    // =====================================
    // 💰 DYNAMIC FOLDER PRICE
    // =====================================

    const sellingPrice =
      Number(
        this.folder?.sellingPrice || 0
      );

    const offerPrice =
      Number(
        this.folder?.offerPrice || 0
      );


    /*
     * Agar offerPrice available hai
     * aur sellingPrice se kam hai
     * to offerPrice use hoga.
     *
     * Otherwise sellingPrice.
     */

    const price =
      offerPrice > 0 &&
      sellingPrice > offerPrice
        ? offerPrice
        : sellingPrice;


    console.log(
      '💰 FOLDER PRICE:',
      {
        sellingPrice,
        offerPrice,
        finalPrice: price
      }
    );


    if (!price || price <= 0) {

      alert(
        'Folder price is not available ❌'
      );

      return;
    }


    // =====================================
    // 💳 CREATE RAZORPAY ORDER
    // =====================================

    this.http.post<any>(
      `/create-order`,
      {
        amount: price
      }
    )
    .subscribe({

      next: (order) => {

        console.log(
          '📦 FOLDER ORDER:',
          order
        );


        // =====================================
        // RAZORPAY OPTIONS
        // =====================================

        const options: any = {

          key:
            environment.razorpayKey,

          amount:
            order.amount,

          currency:
            'INR',

          name:
            'Complete Fat Loss Guide',

          description:
            `Folder Access - ${this.folder?.name}`,

          order_id:
            order.id,


          // =====================================
          // PAYMENT SUCCESS
          // =====================================

          handler: (response: any) => {

            console.log(
              '💳 PAYMENT RESPONSE:',
              response
            );


            // =====================================
            // VERIFY FOLDER PAYMENT
            // =====================================

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
                  price
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


                  /*
                   * Reload folder and access.
                   */

                  this.loadFolder();

                } else {

                  alert(
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


          // =====================================
          // PREFILL USER
          // =====================================

          prefill: {

            name:
              user.name || '',

            contact:
              user.phone || ''

          },


          // =====================================
          // THEME
          // =====================================

          theme: {

            color:
              '#f5c542'

          }

        };


        // =====================================
        // CREATE RAZORPAY INSTANCE
        // =====================================

        const razorpay =
          new Razorpay(options);


        // =====================================
        // OPEN RAZORPAY
        // =====================================

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