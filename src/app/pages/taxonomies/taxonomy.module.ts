import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule } from '../../modules/antd/ng-zorro-antd.module';
import { PipesModule } from '../../pipes/pipes.module';
import { LinkCategoryListComponent } from './link-category-list/link-category-list.component';
import { PostCategoryListComponent } from './post-category-list/post-category-list.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { TaxonomyListComponent } from './taxonomy-list/taxonomy-list.component';
import { TaxonomyRoutingModule } from './taxonomy-routing.module';

@NgModule({
  declarations: [
    PostCategoryListComponent,
    TagListComponent,
    LinkCategoryListComponent,
    TaxonomyListComponent
  ],
  imports: [
    CommonModule,
    TaxonomyRoutingModule,
    NgZorroAntdModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class TaxonomyModule {
}
