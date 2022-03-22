import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkVisible'
})
export class LinkVisiblePipe implements PipeTransform {
  transform(value: string): string {
    const statusMap: Record<string, string> = {
      site: '全站',
      homepage: '首页',
      invisible: '不可见'
    }
    return statusMap[value] || value;
  }
}
