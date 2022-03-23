import { Pipe, PipeTransform } from '@angular/core';
import { LINK_VISIBLE } from '../config/constants';

@Pipe({
  name: 'linkVisible'
})
export class LinkVisiblePipe implements PipeTransform {
  transform(value: string): string {
    return LINK_VISIBLE[value] || value;
  }
}
