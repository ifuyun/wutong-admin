import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinkCategoryListComponent } from './link-category-list/link-category-list.component';
import { PostCategoryListComponent } from './post-category-list/post-category-list.component';
import { TagListComponent } from './tag-list/tag-list.component';

const routes: Routes = [
  { path: 'post-categories', component: PostCategoryListComponent },
  { path: 'tags', component: TagListComponent },
  { path: 'link-categories', component: LinkCategoryListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxonomyRoutingModule {
}
