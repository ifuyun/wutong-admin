import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'post', loadChildren: () => import('./pages/post/post.module').then(m => m.PostModule) },
  { path: 'comment', loadChildren: () => import('./pages/comment/comment.module').then(m => m.CommentModule) },
  { path: 'taxonomy', loadChildren: () => import('./pages/taxonomy/taxonomy.module').then(m => m.TaxonomyModule) },
  { path: 'resource', loadChildren: () => import('./pages/resource/resource.module').then(m => m.ResourceModule) },
  { path: 'link', loadChildren: () => import('./pages/link/link.module').then(m => m.LinkModule) },
  { path: 'setting', loadChildren: () => import('./pages/setting/setting.module').then(m => m.SettingModule) },
  { path: 'log', loadChildren: () => import('./pages/log/log.module').then(m => m.LogModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
