import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'postStatus'
})
export class PostStatusPipe implements PipeTransform {
  transform(value: string): string {
    const statusMap: Record<string, string> = {
      publish: '公开',
      password: '加密',
      private: '隐藏',
      draft: '草稿',
      'auto-draft': '自动保存草稿',
      trash: '已删除'
    }
    return statusMap[value] || value;
  }
}
