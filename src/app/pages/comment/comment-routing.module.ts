import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommentListComponent } from './comment-list/comment-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: CommentListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommentRoutingModule {
}
