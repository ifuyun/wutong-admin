import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
  { path: 'posts', loadChildren: () => import('./posts/post.module').then(m => m.PostModule) },
  { path: 'comments', loadChildren: () => import('./comments/comment.module').then(m => m.CommentModule) },
  { path: 'taxonomies', loadChildren: () => import('./taxonomies/taxonomy.module').then(m => m.TaxonomyModule) },
  { path: 'resources', loadChildren: () => import('./resources/resource.module').then(m => m.ResourceModule) },
  { path: 'links', loadChildren: () => import('./links/link.module').then(m => m.LinkModule) },
  { path: 'options', loadChildren: () => import('./options/option.module').then(m => m.OptionModule) },
  { path: 'logs', loadChildren: () => import('./logs/log.module').then(m => m.LogModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
