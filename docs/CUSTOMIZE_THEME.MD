#### Theme Settings

#### Customizer Usage

![customizer](https://wrappixel.github.io/premium-documentation-wp/styles/dist/images/materialpro/app-customizer.jpg)

The Customizer enables you and your customers to modify
the primary colors, themes, skins, layout options, and
overall appearance of the template in real time.


While we recommend using this for enhanced customization,
its use is entirely optional. Please review both scenarios
carefully to understand its usage and benefits.


Note :

You must have below files in your project :

1\. config.ts Path:
main/src/app/config.ts

2\. core.service.ts Path:
main/src/app/services/core.service.ts

3\. customizer.component.html Path:
main/src/app/layouts/full/shared/customizer/customizer.component.html

4\. customizer.component.ts Path:
main/src/app/layouts/full/shared/customizer/customizer.component.ts

#### 1\. Default settings

```js

// ----------------------------------------------------
// File: src/app/config.ts
// ----------------------------------------------------

export const defaults: AppSettings = {
  dir: 'ltr',
  theme: 'light',
  sidenavOpened: true,
  sidenavCollapsed: false,
  boxed: true,
  horizontal: false,
  cardBorder: false,
  activeTheme: 'blue_theme',
  language: 'en-us',
  navPos: 'side',
};



```

#### 2\. How to set right-to-left (RTL) settings ?

```js

// ----------------------------------------------------
// File: src/app/config.ts
// ----------------------------------------------------

export const defaults: AppSettings = {
  dir: 'rtl', // change is here
  theme: 'light',
  sidenavOpened: true,
  sidenavCollapsed: false,
  boxed: true,
  horizontal: false,
  cardBorder: false,
  activeTheme: 'blue_theme',
  language: 'en-us',
  navPos: 'side',
};



```

#### 3\. How to set Dark theme ?

```js

// ----------------------------------------------------
// File: src/app/config.ts
// ----------------------------------------------------

export const defaults: AppSettings = {
  dir: 'ltr',
  theme: 'dark', // change is here
  sidenavOpened: true,
  sidenavCollapsed: false,
  boxed: true,
  horizontal: false,
  cardBorder: false,
  activeTheme: 'blue_theme',
  language: 'en-us',
  navPos: 'side',
};


```

#### 4\. How to change color theme ?

```js

// ----------------------------------------------------
// File: src/app/config.ts
// ----------------------------------------------------

export const defaults: AppSettings = {
  dir: 'ltr',
  theme: 'light',
  sidenavOpened: true,
  sidenavCollapsed: false,
  boxed: true,
  horizontal: false,
  cardBorder: false,
  // blue_theme, orange_theme, purple_theme, aqua_theme, cyan_theme, green_theme
  activeTheme: 'purple_theme', // change is here
  language: 'en-us',
  navPos: 'side',
};


```

#### 5\. How to set Minisidebar ?

```js

// ----------------------------------------------------
// File: src/app/config.ts
// ----------------------------------------------------

export const defaults: AppSettings = {
  dir: 'ltr',
  theme: 'light',
  sidenavOpened: true,
  sidenavCollapsed: true, // change is here
  boxed: true,
  horizontal: false,
  cardBorder: false,
  activeTheme: 'blue_theme',
  language: 'en-us',
  navPos: 'side',
};


```

#### 6\. How to set Horizontal Layout ?

```js

// ----------------------------------------------------
// File: src/app/config.ts
// ----------------------------------------------------

export const defaults: AppSettings = {
  dir: 'ltr',
  theme: 'light',
  sidenavOpened: true,
  sidenavCollapsed: true, // change is here
  boxed: true,
  horizontal: true, // change is here
  cardBorder: false,
  activeTheme: 'blue_theme',
  language: 'en-us',
  navPos: 'side',
};


```

#### 7\. How to set card Border ?

```js

// ----------------------------------------------------
// File: src/app/config.ts
// ----------------------------------------------------

export const defaults: AppSettings = {
  dir: 'ltr',
  theme: 'light',
  sidenavOpened: true,
  sidenavCollapsed: true, // change is here
  boxed: true,
  horizontal: false,
  cardBorder: true, // change is here
  activeTheme: 'blue_theme',
  language: 'en-us',
  navPos: 'side',
};


```