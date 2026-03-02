#### Icons

#### 1\. Tabler Icons

[https://tabler-icons.io/](https://tabler-icons.io/)

```js

// ----------------------------------------------------------------------
// app.module.ts
// ----------------------------------------------------------------------

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

@NgModule({
  declarations: [],
  imports: [\
    TablerIconsModule.pick(TablerIcons),\
  ],
  exports: [TablerIconsModule],
})

// ----------------------------------------------------------------------
// usage
// ----------------------------------------------------------------------
<i-tabler name="home" class="icon-20"></i-tabler>
<i-tabler name="points" class="icon-20"></i-tabler>
<i-tabler name="grid-dots" class="icon-20"></i-tabler>



```