import { Pipe, PipeTransform } from '@angular/core';
import { COMMENT_FLAG } from '../config/constants';

@Pipe({
  name: 'commentFlag'
})
export class CommentFlagPipe implements PipeTransform {
  transform(value: string): string {
    return COMMENT_FLAG[value] || value;
  }
}
