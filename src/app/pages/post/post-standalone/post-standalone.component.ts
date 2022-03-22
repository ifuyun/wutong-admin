import { Component } from '@angular/core';
import { PostType } from '../../../config/common.enum';

@Component({
  selector: 'app-post-standalone',
  template: `
    <app-post-list [postType]="postType"></app-post-list>
  `
})
export class PostStandaloneComponent {
  postType = PostType.PAGE;
}
