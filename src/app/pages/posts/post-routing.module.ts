import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleEditComponent } from './article-edit/article-edit.component';
import { ArticleListComponent } from './article-list/article-list.component';
import { StandaloneEditComponent } from './standalone-edit/standalone-edit.component';
import { StandaloneListComponent } from './standalone-list/standalone-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ArticleListComponent },
  { path: 'edit', component: ArticleEditComponent },
  { path: 'standalone', component: StandaloneListComponent },
  { path: 'edit-standalone', component: StandaloneEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostRoutingModule {
}
