import { Pipe, PipeTransform } from '@angular/core';
import { TAXONOMY_STATUS } from '../config/constants';

@Pipe({
  name: 'taxonomyStatus'
})
export class TaxonomyStatusPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (value === undefined) {
      return '';
    }
    return TAXONOMY_STATUS[value] || value.toString();
  }
}
