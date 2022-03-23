import { Pipe, PipeTransform } from '@angular/core';
import { COMMENT_STATUS } from '../config/constants';

@Pipe({
  name: 'commentStatus'
})
export class CommentStatusPipe implements PipeTransform {
  transform(value: string): string {
    return COMMENT_STATUS[value] || value;
  }
}
