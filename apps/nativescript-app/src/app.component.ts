import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <ActionBar title="My App" class="action-bar"></ActionBar>
    <StackLayout>
      <Label>Hello World!</Label>
    </StackLayout>
  `,
})
export class AppComponent {

}
