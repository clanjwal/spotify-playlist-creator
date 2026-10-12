import { Component, ElementRef, inject, input, output, signal } from '@angular/core';

/**
 * A number field with a dropdown of suggested values. Any whole number can be typed; one larger than `max`
 * is shown as `max` (the number of songs), so everything fits on one page.
 */
@Component({
  selector: 'app-page-size-select',
  templateUrl: './page-size-select.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(keydown.escape)': 'open.set(false)'
  }
})
export class PageSizeSelect {
  /** The page size currently in use. */
  readonly value = input.required<number>();
  readonly options = input<number[]>([]);
  /** Largest useful value (the number of songs); 0 when unknown. */
  readonly max = input(0);
  readonly inputId = input('page-size');
  /** Emits the number the user asked for, before it is capped at `max`. */
  readonly sizeChange = output<number>();

  protected readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected onType(field: HTMLInputElement) {
    const digits = field.value.replace(/\D/g, '');
    if (digits !== field.value) {
      field.value = digits;
    }
    const size = Number(digits);
    if (!digits || size < 1) {
      return;
    }
    this.commit(field, size);
  }

  protected choose(field: HTMLInputElement, size: number) {
    this.commit(field, size);
    this.open.set(false);
  }

  /** Puts the size in use back into the field, e.g. after it was left empty. */
  protected restore(field: HTMLInputElement) {
    field.value = String(this.value());
  }

  protected toggle() {
    this.open.update(o => !o);
  }

  private commit(field: HTMLInputElement, size: number) {
    const max = this.max();
    // The parent applies the same cap, but its value only reaches this component after the next render
    field.value = String(max > 0 ? Math.min(size, max) : size);
    this.sizeChange.emit(size);
  }

  protected onDocumentClick(event: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
