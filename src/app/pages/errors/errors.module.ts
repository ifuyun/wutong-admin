import { NgModule } from '@angular/core';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  declarations: [
    NotFoundComponent,
    ForbiddenComponent
  ],
  imports: [],
  exports: [
    NotFoundComponent,
    ForbiddenComponent
  ]
})
export class ErrorsModule {
}
