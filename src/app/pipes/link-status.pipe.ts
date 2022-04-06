import { Pipe, PipeTransform } from '@angular/core';
import { LINK_STATUS } from '../config/constants';

@Pipe({
  name: 'linkStatus'
})
export class LinkStatusPipe implements PipeTransform {
  transform(value: string): string {
    return LINK_STATUS[value] || value;
  }
}
