import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OptionEntity } from './interfaces/options';
import { OptionsService } from './services/options.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  openMap: Record<string, boolean> = {
    home: true,
    post: false,
    comment: false,
    taxonomy: false,
    link: false,
    setting: false,
    resource: false,
    log: false
  };
  options$!: Observable<OptionEntity>;

  constructor(
    private optionsService: OptionsService
  ) {
    this.options$ = optionsService.options$;
  }

  ngOnInit(): void {
    this.optionsService.getOptions().subscribe();
  }

  openHandler(value: string): void {
    for (const key in this.openMap) {
      if (key !== value) {
        this.openMap[key] = false;
      }
    }
  }
}
