#### Routing

#### 1\. How to add a new route?

```js

// ----------------------------------------------------
// File: src/app/app.routes.ts
// ----------------------------------------------------

const routes: Routes = [\
  {\
    path: '',\
    component: FullComponent,\
    children: [\
      {\
        path: '',\
        redirectTo: '/landingpage',\
        pathMatch: 'full',\
      },\
      // new added\
      {\
        path: 'starter',\
        loadChildren: () =>\
          import('./pages/pages.routes').then((m) => m.PagesRoutes),\
      },\
    ],\
  },\
];




```

#### 2\. How to add page to sidebar ?

```js

// ----------------------------------------------------
// File: src/app/layouts/full/vertical/sidebar/sidebar-data.ts
// ----------------------------------------------------

export const navItems: NavItem[] = [\
  {\
    displayName: 'Starter',\
    iconName: 'aperture',\
    route: '/starter',\
  },\
]


```