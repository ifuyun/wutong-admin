import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleEditComponent } from './article-edit/article-edit.component';
import { ArticleListComponent } from './article-list/article-list.component';
import { PageEditComponent } from './page-edit/page-edit.component';
import { PageListComponent } from './page-list/page-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ArticleListComponent },
  { path: 'articles', component: ArticleListComponent },
  { path: 'edit-article', component: ArticleEditComponent },
  { path: 'pages', component: PageListComponent },
  { path: 'edit-page', component: PageEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostRoutingModule {
}
