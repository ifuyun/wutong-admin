import { Component } from '@angular/core';
import { PostType } from '../../../config/common.enum';

@Component({
  selector: 'app-standalone-list',
  template: `
    <app-post-list [postType]="postType"></app-post-list>
  `
})
export class StandaloneListComponent {
  postType = PostType.PAGE;
}
