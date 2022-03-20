export interface BreadcrumbEntity {
  label: string;
  url: string;
  tooltip: string;
}

export interface BreadcrumbData {
  visible: boolean;
  list: BreadcrumbEntity[];
}
