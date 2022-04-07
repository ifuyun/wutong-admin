import { Component } from '@angular/core';
import { TaxonomyType } from '../../../config/common.enum';

@Component({
  selector: 'app-link-category-list',
  template: `
    <app-taxonomy-list [taxonomyType]="taxonomyType"></app-taxonomy-list>
  `
})
export class LinkCategoryListComponent {
  taxonomyType = TaxonomyType.LINK;
}
