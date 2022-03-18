import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinkTaxonomyComponent } from './link-taxonomy/link-taxonomy.component';
import { PostTaxonomyComponent } from './post-taxonomy/post-taxonomy.component';
import { TagListComponent } from './tag-list/tag-list.component';

const routes: Routes = [
  { path: 'post', component: PostTaxonomyComponent },
  { path: 'tag', component: TagListComponent },
  { path: 'link', component: LinkTaxonomyComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxonomyRoutingModule {
}
