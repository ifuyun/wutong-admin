import { Component } from '@angular/core';
import { PostType } from '../../../config/common.enum';

@Component({
  selector: 'app-standalone-edit',
  template: `
    <app-post-form [postType]="postType"></app-post-form>
  `
})
export class StandaloneEditComponent {
  postType = PostType.PAGE;
}
