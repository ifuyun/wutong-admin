import { Component } from '@angular/core';
import { TaxonomyType } from '../../../config/common.enum';

@Component({
  selector: 'app-tag-taxonomy',
  template: `
    <app-taxonomy-list [taxonomyType]="taxonomyType"></app-taxonomy-list>
  `
})
export class TagListComponent {
  taxonomyType = TaxonomyType.TAG;
}
