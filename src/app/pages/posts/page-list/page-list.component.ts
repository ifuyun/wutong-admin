import { Component } from '@angular/core';
import { PostType } from '../../../config/common.enum';

@Component({
  selector: 'app-page-list',
  template: `
    <app-post-list [postType]="postType"></app-post-list>
  `
})
export class PageListComponent {
  postType = PostType.PAGE;
}
