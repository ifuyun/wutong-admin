import { Pipe, PipeTransform } from '@angular/core';
import { POST_TYPE } from '../config/constants';

@Pipe({
  name: 'postType'
})
export class PostTypePipe implements PipeTransform {
  transform(value: string): string {
    return POST_TYPE[value] || value;
  }
}
