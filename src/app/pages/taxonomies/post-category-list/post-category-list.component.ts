import { Component } from '@angular/core';
import { TaxonomyType } from '../../../config/common.enum';

@Component({
  selector: 'app-post-category-list',
  template: `
    <app-taxonomy-list [taxonomyType]="taxonomyType"></app-taxonomy-list>
  `
})
export class PostCategoryListComponent {
  taxonomyType = TaxonomyType.POST;
}
