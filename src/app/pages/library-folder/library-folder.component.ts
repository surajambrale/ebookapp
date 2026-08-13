import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLinkActive,
  RouterLink,
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';


import {
  HttpClient
} from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment.prod';

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

  ) { }

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
            'FOLDER DETAIL:',
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

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'FOLDER LOAD ERROR:',
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
      'OPEN CONTENT:',
      content
    );

    /*
      Yaha tumhara existing PDF/video/note
      opening logic rahega.

      Old content code ko abhi remove mat karo.
    */
  }

  // =====================================
  // BUY FOLDER
  // =====================================

  buyFolder(): void {

  // =========================================
  // 🔐 LOGIN CHECK
  // =========================================

  if (!this.auth.isLoggedIn()) {

    localStorage.setItem(
      'redirectAfterLogin',
      `/library/folder/${this.folderId}`
    );

    this.router.navigate(['/login']);

    return;
  }


  // =========================================
  // 👤 USER
  // =========================================

  const user =
    this.auth.getUser();


  if (!user || !user._id) {

    alert(
      'Please login again ❌'
    );

    this.router.navigate(['/login']);

    return;
  }


  // =========================================
  // 💰 PRICE
  // =========================================

  const price =
    Number(
      this.folder?.offerPrice > 0
        ? this.folder.offerPrice
        : this.folder?.sellingPrice
    );


  if (!price || price <= 0) {

    alert(
      'Folder price is not available ❌'
    );

    return;
  }


  // =========================================
  // CREATE RAZORPAY ORDER
  // =========================================

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


        handler:
          (response: any) => {

            console.log(
              '💳 PAYMENT RESPONSE:',
              response
            );


            // =================================
            // VERIFY FOLDER PAYMENT
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
                  price

              }
            )
            .subscribe({

              next:
                (verifyRes) => {

                  console.log(
                    '✅ FOLDER PAYMENT VERIFIED:',
                    verifyRes
                  );


                  if (
                    verifyRes.success
                  ) {

                    alert(
                      'Folder unlocked successfully 🎉'
                    );


                    // =================================
                    // RELOAD FOLDER
                    // =================================

                    this.loadFolder();

                  }

                },

              error:
                (error) => {

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


        prefill: {

          name:
            user.name || '',

          contact:
            user.phone || ''

        },


        theme: {

          color:
            '#f5c542'

        }

      };


      // =====================================
      // OPEN RAZORPAY
      // =====================================

      const razorpay =
        new Razorpay(options);

        


      razorpay.open();

    },

    error:
      (error) => {

        console.error(
          '❌ CREATE FOLDER ORDER ERROR:',
          error
        );


        alert(
          'Unable to create payment order ❌'
        );

      }

  });

}
  // =====================================
  // BACK
  // =====================================

  goBack(): void {

    if (window.history.length > 1) {

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