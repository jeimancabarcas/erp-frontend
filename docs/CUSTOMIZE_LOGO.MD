#### Change Logo

#### Change Logo

##### To change logo :   src/app/layouts/full/vertical/sidebar/branding.component.ts

Put the logo image into the assets/images/logos folder.


```js

import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
selector: 'app-branding',
imports: [],
template: `
  <a href="/" class="logodark">
    <img
    src="./assets/images/logos/dark-logo.svg"
    class="align-middle m-2"
    alt="logo"
    />
  </a>

  <a href="/" class="logolight">
    <img
    src="./assets/images/logos/light-logo.svg"
    class="align-middle m-2"
    alt="logo"
    />
  </a>
`,
})
export class BrandingComponent {
  options = this.settings.getOptions();
  constructor(private settings: CoreService) {}
}




```