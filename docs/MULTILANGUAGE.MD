#### Multi Language

#### 1\. Add content

```js

// ----------------------------------------------------
// File: src/assets/i18n/de.json
// ----------------------------------------------------

{
  "Analytical": "Analytisch",
  "eCommerce": "E-Commerce",
  "Chat": "Plaudern",
}

// ----------------------------------------------------
// File: src/assets/i18n/en.json
// ----------------------------------------------------

{
  "Analytical": "Analytical",
  "eCommerce": "eCommerce",
  "Chat": "Chat",
}

// ----------------------------------------------------
// File: src/assets/i18n/es.json
// ----------------------------------------------------

{
  "Analytical": "Analítica",
  "eCommerce": "comércio eletrônico",
  "Chat": "Bater papo",
}

// ----------------------------------------------------
// File: src/assets/i18n/fr.json
// ----------------------------------------------------

{
  "Analytical": "Analytique",
  "eCommerce": "commerce électronique",
  "Chat": "Discuter",
}



```

#### 2\. Usage

```js

// ----------------------------------------------------
// File: src/app/layouts/full/vertical/header/header.component.ts
// ----------------------------------------------------

public selectedLanguage: any = {
  language: 'English',
  code: 'en',
  type: 'US',
  icon: '/assets/images/flag/icon-flag-en.svg',
};

public languages: any[] = [\
  {\
    language: 'English',\
    code: 'en',\
    type: 'US',\
    icon: '/assets/images/flag/icon-flag-en.svg',\
  },\
  {\
    language: 'Español',\
    code: 'es',\
    icon: '/assets/images/flag/icon-flag-es.svg',\
  },\
  {\
    language: 'Français',\
    code: 'fr',\
    icon: '/assets/images/flag/icon-flag-fr.svg',\
  },\
  {\
    language: 'German',\
    code: 'de',\
    icon: '/assets/images/flag/icon-flag-de.svg',\
  },\
];

constructor(
    private translate: TranslateService
  ) {
    translate.setDefaultLang('en');
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

// ----------------------------------------------------
// File: src/app/layouts/full/vertical/header/header.component.html
// ----------------------------------------------------
<button [matMenuTriggerFor]="flags" mat-icon-button class="m-r-5">
  <img
    [src]="selectedLanguage.icon"
    class="rounded-circle object-cover icon-20"
  />
</button>
<mat-menu #flags="matMenu" class="cardWithShadow">
  <button
    mat-menu-item
    *ngFor="let lang of languages"
    (click)="changeLanguage(lang)"
  >
    <div class="d-flex align-items-center">
      <img
        [src]="lang.icon"
        class="rounded-circle object-cover m-r-8 icon-20"
      />
      <span class="mat-subtitle-1 f-s-14">{{ lang.language }}</span>
    </div>
  </button>
</mat-menu>


```