import { Pipe, PipeTransform } from '@angular/core';
import { LINK_SCOPE } from '../config/constants';

@Pipe({
  name: 'linkScope'
})
export class LinkScopePipe implements PipeTransform {
  transform(value: string): string {
    return LINK_SCOPE[value] || value;
  }
}
