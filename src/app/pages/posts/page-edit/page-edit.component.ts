import { Component } from '@angular/core';
import { PostType } from '../../../config/common.enum';

@Component({
  selector: 'app-page-edit',
  template: `
    <app-post-form [postType]="postType"></app-post-form>
  `
})
export class PageEditComponent {
  postType = PostType.PAGE;
}
