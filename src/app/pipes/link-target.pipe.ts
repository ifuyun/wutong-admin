import { Pipe, PipeTransform } from '@angular/core';
import { LINK_TARGET } from '../config/constants';

@Pipe({
  name: 'linkTarget'
})
export class LinkTargetPipe implements PipeTransform {
  transform(value: string): string {
    return LINK_TARGET[value] || value;
  }
}
