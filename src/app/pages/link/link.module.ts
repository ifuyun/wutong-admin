import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule } from '../../modules/antd/ng-zorro-antd.module';
import { PipesModule } from '../../pipes/pipes.module';
import { LinkListComponent } from './link-list/link-list.component';
import { LinkRoutingModule } from './link-routing.module';

@NgModule({
  declarations: [
    LinkListComponent
  ],
  imports: [
    CommonModule,
    LinkRoutingModule,
    NgZorroAntdModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LinkModule {
}
