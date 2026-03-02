#### Color

#### Override Colors (Light / Dark Theme)

##### For any change in colors :  src/assets/scss/themecolors/\_blue\_theme.scss

```js

@use "sass:map";
@use "@angular/material" as mat;

html.blue_theme {
  --mat-sys-primary: rgb(27, 132, 255);
  --mat-sys-primary-fixed-dim: rgb(27, 132, 255, 0.15);
  --mat-sys-secondary: rgb(67, 206, 215);
  --mat-sys-secondary-fixed-dim: rgb(67, 206, 215, 0.15);
}


```

#### Light Theme Variables Settings

##### For any change in colors :  src/assets/scss/theme-variables/\_light-theme-variables.scss

```js

html.light-theme {
  color-scheme: light;
  --mat-sys-corner-small: 10px;
  --mat-sys-background: #eef5f9;
  --mat-sys-surface-bright: #f2f2f2;
  --mat-sys-surface: #fff;
  --mat-sys-surface-container: #fff;
  --mat-sys-surface-container-low: #fff;
  --mat-sys-surface-container-lowest: #768b9e;
  --mat-sys-on-background: #3a4752;
  --mat-sys-outline: #ebf1f6;
  --mat-sys-outline-variant: #ebf1f6;
  --mdc-outlined-text-field-hover-outline-color: #ebf1f6;
  --mdc-checkbox-unselected-hover-state-layer-color: #ebf1f6;
  --mat-menu-item-hover-state-layer-color: #f6f9fc;
  --mat-standard-button-toggle-state-layer-color: #f6f9fc;
  --mat-option-focus-state-layer-color: #f6f9fc;
  --mat-option-hover-state-layer-color: #f6f9fc;
  --mdc-switch-unselected-track-color: #f6f9fc;
  --mat-stepper-header-focus-state-layer-color: #f6f9fc;
  --mat-stepper-header-hover-state-layer-color: #f6f9fc;
  --mdc-dialog-supporting-text-color: var(--mat-sys-on-background);
  --mat-expansion-header-hover-state-layer-color: #f6f9fc;
}



```

#### Dark Theme Variables Settings

##### For any change in colors :  src/assets/scss/theme-variables/\_dark-theme-variables.scss

```js

html.dark-theme {
  color-scheme: dark;
  --mat-sys-background: #141a21;
  --mat-sys-on-background: rgba(255, 255, 255, 0.9);
  --mat-sys-on-primary: #fff;
  --mat-sys-surface-bright: #ffffff05;
  --mat-sys-surface: #141a21;
  --mat-sys-surface-container: #141a21;
  --mat-sys-surface-container-low: #141a21;
  --mat-sys-outline-variant: #2e3f50;
  --mat-sys-outline: #2e3f50;
  --mdc-outlined-text-field-hover-outline-color: #465670;
  --mdc-checkbox-unselected-hover-state-layer-color: #19212a;
  --mat-menu-item-hover-state-layer-color: #19212a;
  --mat-standard-button-toggle-state-layer-color: #19212a;
  --mat-option-focus-state-layer-color: #19212a;
  --mat-option-hover-state-layer-color: #19212a;
  --mdc-switch-unselected-track-color: #19212a;
  --mat-stepper-header-focus-state-layer-color: #19212a;
  --mat-stepper-header-hover-state-layer-color: #19212a;
  --mat-expansion-header-hover-state-layer-color: #19212a;
  @include mat.card-overrides(
    (
      elevated-container-color: #1c252e,
      elevated-container-elevation: rgba(0, 0, 0, 0.2) 0px 0px 2px 0px,
      subtitle-text-color: rgba(255, 255, 255, 0.67),
    )
  );
  @include mat.theme-overrides(
    (
      level1: 0px 12px 24px -4px rgba(143, 176, 210, 0.02),
      level2: 0px 12px 24px -4px rgba(143, 176, 210, 0.02),
      level3: 0px 12px 24px -4px rgba(143, 176, 210, 0.02),
    )
  );
}


```