import { Component, computed, input, output } from '@angular/core';
import { pageItems } from '../../utils/tracks';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.html'
})
export class Pager {
  /** Current page, starting at 1. */
  readonly page = input.required<number>();
  readonly pageCount = input.required<number>();
  /** Text shown at the left, such as which songs are on this page. */
  readonly summary = input('');
  readonly pageChange = output<number>();

  protected readonly items = computed(() => pageItems(this.page(), this.pageCount()));
}
