import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';


@Component({
  selector: 'app-sidebar',
  imports: [TablerIconsModule, MaterialModule, TranslateModule],

  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  authService = inject(AuthService);
  constructor() { }
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  ngOnInit(): void { }
}
