import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PostFormComponent } from './post-form/post-form.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostRoutingModule } from './post-routing.module';
import { PostStandaloneComponent } from './post-standalone/post-standalone.component';
import { StandaloneFormComponent } from './standalone-form/standalone-form.component';

@NgModule({
  declarations: [
    PostListComponent,
    PostFormComponent,
    PostStandaloneComponent,
    StandaloneFormComponent
  ],
  imports: [
    CommonModule,
    PostRoutingModule
  ]
})
export class PostModule {
}
