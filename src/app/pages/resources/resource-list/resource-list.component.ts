import { Component } from '@angular/core';
import { PostType } from '../../../config/common.enum';

@Component({
  selector: 'app-resource-list',
  template: `
    <app-post-list [postType]="postType"></app-post-list>
  `
})
export class ResourceListComponent {
  postType = PostType.ATTACHMENT;
}
