import { Component } from '@angular/core';
import { TaxonomyType } from '../../../config/common.enum';

@Component({
  selector: 'app-link-taxonomy',
  template: `
    <app-taxonomy-list [taxonomyType]="taxonomyType"></app-taxonomy-list>
  `
})
export class LinkTaxonomyComponent {
  taxonomyType = TaxonomyType.LINK;
}
