import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkTarget'
})
export class LinkTargetPipe implements PipeTransform {
  transform(value: string): string {
    const statusMap: Record<string, string> = {
      _blank: '新页面',
      _top: '父页面',
      _self: '当前页'
    }
    return statusMap[value] || value;
  }
}
