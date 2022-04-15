import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgZorroAntdModule } from '../../modules/antd/ng-zorro-antd.module';
import { CommentModule } from '../comments/comment.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NgZorroAntdModule,
    CommentModule
  ],
  exports: [HomeComponent]
})
export class HomeModule {
}
