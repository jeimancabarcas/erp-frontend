#### Authentication

#### Authguard

##### Auth guard provide lifecycle event called canActivate. The canActivate is like a constructor. It will be called before accessing the routes. The canActivate has to return true to access the page. If it returns false, we can not access the page. We can write our user authorization and authentication logic inside the canActivate function.

```

// -----------------------------------------------------------------------------------------
// File : src/app/login.service.ts
// -----------------------------------------------------------------------------------------

import { Injectable } from '@angular/core';

@Injectable()
export class LoginService {
  constructor() {}

  checkusernameandpassword(uname: string, pwd: string) {
    if (uname === 'admin' && pwd === 'admin123') {
      localStorage.setItem('username', 'admin');
      return true;
    } else {
      return false;
    }
  }
}

// -----------------------------------------------------------------------------------------
// File : src/app/auth.guard.ts
// -----------------------------------------------------------------------------------------
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private routes: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (localStorage.getItem('username') != null) {
      return true;
    } else {
      this.routes.navigate(['/authentication/side-login']);
      return false;
    }
  }
}

// -----------------------------------------------------------------------------------------
// File : src/app/app-routing.module.ts
// -----------------------------------------------------------------------------------------
import { AuthGuard } from './auth.guard';
const routes: Routes = [\
  {\
    path: '',\
    component: FullComponent,\
    canActivate: [AuthGuard],\
    children: [\
      {\
        path: '',\
        redirectTo: '/starter',\
        pathMatch: 'full',\
      },\
      {\
        path: 'starter',\
        loadChildren: () =>\
          import('./pages/pages.module').then((m) => m.PagesModule),\
      },\
    ],\
  },\
];



```