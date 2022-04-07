import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { NgZorroAntdModule } from '../../modules/antd/ng-zorro-antd.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ArticleEditComponent } from './article-edit/article-edit.component';
import { ArticleListComponent } from './article-list/article-list.component';
import { PostFormComponent } from './post-form/post-form.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostRoutingModule } from './post-routing.module';
import { StandaloneEditComponent } from './standalone-edit/standalone-edit.component';
import { StandaloneListComponent } from './standalone-list/standalone-list.component';

@NgModule({
  declarations: [
    PostListComponent,
    PostFormComponent,
    ArticleListComponent,
    ArticleEditComponent,
    StandaloneListComponent,
    StandaloneEditComponent
  ],
  imports: [
    CommonModule,
    PostRoutingModule,
    NgZorroAntdModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule,
    EditorModule
  ],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
  ],
  exports: [
    PostListComponent
  ]
})
export class PostModule {
}
