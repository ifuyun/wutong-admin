import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commentStatus'
})
export class CommentStatusPipe implements PipeTransform {
  transform(value: string): string {
    const statusMap: Record<string, string> = {
      normal: '正常',
      pending: '待审',
      reject: '驳回',
      spam: '垃圾评论',
      trash: '已删除'
    }
    return statusMap[value] || value;
  }
}
