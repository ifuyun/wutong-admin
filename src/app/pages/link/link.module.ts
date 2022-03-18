import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LinkListComponent } from './link-list/link-list.component';
import { LinkRoutingModule } from './link-routing.module';

@NgModule({
  declarations: [
    LinkListComponent
  ],
  imports: [
    CommonModule,
    LinkRoutingModule
  ]
})
export class LinkModule {
}
