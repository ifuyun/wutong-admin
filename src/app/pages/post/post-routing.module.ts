import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleListComponent } from './article-list/article-list.component';
import { PostFormComponent } from './post-form/post-form.component';
import { PostStandaloneComponent } from './post-standalone/post-standalone.component';
import { StandaloneFormComponent } from './standalone-form/standalone-form.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ArticleListComponent },
  { path: 'form', component: PostFormComponent },
  { path: 'standalone', component: PostStandaloneComponent },
  { path: 'form-standalone', component: StandaloneFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostRoutingModule {
}
