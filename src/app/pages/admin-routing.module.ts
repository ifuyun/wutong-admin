import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
  { path: 'post', loadChildren: () => import('./post/post.module').then(m => m.PostModule) },
  { path: 'comment', loadChildren: () => import('./comment/comment.module').then(m => m.CommentModule) },
  { path: 'taxonomy', loadChildren: () => import('./taxonomy/taxonomy.module').then(m => m.TaxonomyModule) },
  { path: 'resource', loadChildren: () => import('./resource/resource.module').then(m => m.ResourceModule) },
  { path: 'link', loadChildren: () => import('./link/link.module').then(m => m.LinkModule) },
  { path: 'setting', loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule) },
  { path: 'log', loadChildren: () => import('./log/log.module').then(m => m.LogModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
