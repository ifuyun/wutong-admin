import { Pipe, PipeTransform } from '@angular/core';
import { POST_STATUS } from '../config/constants';

@Pipe({
  name: 'postStatus'
})
export class PostStatusPipe implements PipeTransform {
  transform(value: string): string {
    return POST_STATUS[value] || value;
  }
}
