import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GeneralOptionsComponent } from './general-options/general-options.component';
import { OptionRoutingModule } from './option-routing.module';
import { WritingOptionsComponent } from './writing-options/writing-options.component';
import { ReadingOptionsComponent } from './reading-options/reading-options.component';
import { DiscussionOptionsComponent } from './discussion-options/discussion-options.component';

@NgModule({
  declarations: [
    GeneralOptionsComponent,
    WritingOptionsComponent,
    ReadingOptionsComponent,
    DiscussionOptionsComponent
  ],
  imports: [
    CommonModule,
    OptionRoutingModule
  ]
})
export class OptionModule {
}
