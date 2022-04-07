import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscussionOptionsComponent } from './discussion-options/discussion-options.component';
import { GeneralOptionsComponent } from './general-options/general-options.component';
import { ReadingOptionsComponent } from './reading-options/reading-options.component';
import { WritingOptionsComponent } from './writing-options/writing-options.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'general' },
  { path: 'general', component: GeneralOptionsComponent },
  { path: 'writing', component: WritingOptionsComponent },
  { path: 'reading', component: ReadingOptionsComponent },
  { path: 'discussion', component: DiscussionOptionsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OptionRoutingModule {
}
