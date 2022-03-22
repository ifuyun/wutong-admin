import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taxonomyStatus'
})
export class TaxonomyStatusPipe implements PipeTransform {
  transform(value: number | undefined): string {
    const statusMap: Record<number, string> = {
      0: '不公开',
      1: '公开',
      2: '已删除'
    };
    if (value === undefined) {
      return '';
    }
    return statusMap[value] || value.toString();
  }
}
