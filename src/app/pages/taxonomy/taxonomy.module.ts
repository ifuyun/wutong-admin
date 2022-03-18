import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LinkTaxonomyComponent } from './link-taxonomy/link-taxonomy.component';
import { PostTaxonomyComponent } from './post-taxonomy/post-taxonomy.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { TaxonomyRoutingModule } from './taxonomy-routing.module';

@NgModule({
  declarations: [
    PostTaxonomyComponent,
    TagListComponent,
    LinkTaxonomyComponent
  ],
  imports: [
    CommonModule,
    TaxonomyRoutingModule
  ]
})
export class TaxonomyModule {
}
