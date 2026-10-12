import { Component, computed, model, signal } from '@angular/core';
import { formatIsoDate } from '../../utils/dates';

interface Day {
  iso: string;
  day: number;
  disabled: boolean;
  /** Weekday column, 0 (Sunday) to 6 (Saturday). */
  col: number;
  isLastOfMonth: boolean;
}

interface Month {
  year: number;
  month: number;
  // Leading nulls pad the first week so days line up under their weekday header
  cells: (Day | null)[];
}

// Spotify launched in 2008, so no liked song can be older than that
const MIN_YEAR = 2008;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
// A month as a single number so months can be compared and stepped through arithmetically
const monthIndex = (y: number, m: number) => y * 12 + m;

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.html'
})
export class DateRangePicker {
  /** Selected range as ISO dates (YYYY-MM-DD), both inclusive. */
  readonly start = model<string | null>(null);
  readonly end = model<string | null>(null);

  private readonly today = new Date();
  protected readonly todayIso = toIso(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
  protected readonly minIso = toIso(MIN_YEAR, 0, 1);

  private readonly minIndex = monthIndex(MIN_YEAR, 0);
  private readonly todayIndex = monthIndex(this.today.getFullYear(), this.today.getMonth());
  // The left calendar can go no further than last month, so the right one ends on the current month
  private readonly maxLeftIndex = this.todayIndex - 1;
  // Index of the month shown on the left; the next month is shown beside it
  private readonly viewIndex = signal(this.maxLeftIndex);

  protected readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  protected readonly monthNames = Array.from({ length: 12 }, (_, m) =>
    new Date(2000, m, 1).toLocaleDateString(undefined, { month: 'long' })
  );
  protected readonly years = Array.from(
    { length: this.today.getFullYear() - MIN_YEAR + 1 },
    (_, i) => MIN_YEAR + i
  );
  protected readonly hovered = signal<string | null>(null);

  protected readonly months = computed<Month[]>(() => {
    const left = this.viewIndex();
    return [this.buildMonth(left), this.buildMonth(left + 1)];
  });

  protected readonly canGoBack = computed(() => this.viewIndex() > this.minIndex);
  protected readonly canGoForward = computed(() => this.viewIndex() < this.maxLeftIndex);

  // While picking the end date, preview the range up to the hovered day
  private readonly previewEnd = computed(() => {
    const start = this.start();
    if (start && !this.end()) {
      const hovered = this.hovered();
      return hovered && hovered >= start ? hovered : start;
    }
    return this.end();
  });

  protected readonly hint = computed(() => {
    if (!this.start()) {
      return 'Type a start date or pick it on the calendar';
    }
    return this.end() ? '' : 'Now pick the last day';
  });

  protected readonly format = formatIsoDate;

  protected shift(months: number) {
    this.setView(this.viewIndex() + months);
  }

  /** `column` is 0 for the left calendar and 1 for the right one. */
  protected setMonth(column: number, month: string) {
    const year = Math.floor((this.viewIndex() + column) / 12);
    this.setView(monthIndex(year, Number(month)) - column);
  }

  protected setYear(column: number, year: string) {
    const month = (this.viewIndex() + column) % 12;
    this.setView(monthIndex(Number(year), month) - column);
  }

  protected isMonthDisabled(month: Month, monthOfYear: number, column: number) {
    return monthIndex(month.year, monthOfYear) - column > this.maxLeftIndex;
  }

  protected select(day: Day) {
    const start = this.start();
    if (!start || this.end()) {
      this.start.set(day.iso);
      this.end.set(null);
    } else if (day.iso < start) {
      this.end.set(start);
      this.start.set(day.iso);
    } else {
      this.end.set(day.iso);
    }
    this.hovered.set(null);
  }

  /** Handles a date typed into one of the text fields. Values that are incomplete or out of bounds are ignored. */
  protected typeDate(which: 'start' | 'end', value: string) {
    if (!value) {
      (which === 'start' ? this.start : this.end).set(null);
      return;
    }
    if (!ISO_DATE.test(value) || value < this.minIso || value > this.todayIso) {
      return;
    }

    const start = this.start();
    const end = this.end();
    if (which === 'start') {
      // A start after the end swaps them, as a click on the calendar would
      if (end && value > end) {
        this.start.set(end);
        this.end.set(value);
      } else {
        this.start.set(value);
      }
    } else if (start && value < start) {
      this.end.set(start);
      this.start.set(value);
    } else {
      this.end.set(value);
    }
    this.reveal(value);
  }

  protected clear() {
    this.start.set(null);
    this.end.set(null);
    this.hovered.set(null);
  }

  protected isSelected(iso: string) {
    return iso === this.start() || iso === this.end();
  }

  protected cellClass(day: Day) {
    const today = day.iso === this.todayIso ? ' font-semibold underline' : '';
    const start = this.start();
    const end = this.previewEnd();
    if (day.iso === start || day.iso === end) {
      return 'bg-green-500 font-semibold text-black';
    }
    if (start && end && day.iso > start && day.iso < end) {
      return 'text-green-300 hover:bg-green-500/30' + today;
    }
    return day.disabled ? '' : 'text-neutral-200 hover:bg-white/10' + today;
  }

  /**
   * The band behind a day. Bands are full cell width so neighbouring days join up with no gaps. The start
   * and end days only fill the half towards the range, and the circle drawn over them rounds the band off.
   * Bands also round off where a row of the calendar ends.
   */
  protected stripClass(day: Day) {
    const start = this.start();
    const end = this.previewEnd();
    if (!start || !end || start === end || day.iso < start || day.iso > end) {
      return '';
    }

    const roundLeft = day.col === 0 || day.day === 1 ? ' rounded-l-full' : '';
    const roundRight = day.col === 6 || day.isLastOfMonth ? ' rounded-r-full' : '';
    if (day.iso === start) {
      return 'left-1/2 right-0' + roundRight;
    }
    if (day.iso === end) {
      return 'left-0 right-1/2' + roundLeft;
    }
    return 'inset-x-0' + roundLeft + roundRight;
  }

  private setView(index: number) {
    this.viewIndex.set(Math.min(this.maxLeftIndex, Math.max(this.minIndex, index)));
  }

  // Scroll the calendar to a typed date if it is not already on screen
  private reveal(iso: string) {
    const [y, m] = iso.split('-').map(Number);
    const index = monthIndex(y, m - 1);
    const left = this.viewIndex();
    if (index !== left && index !== left + 1) {
      this.setView(index);
    }
  }

  private buildMonth(index: number): Month {
    const year = Math.floor(index / 12);
    const month = index % 12;
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Day | null)[] = Array.from({ length: first.getDay() }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toIso(year, month, day);
      cells.push({
        iso,
        day,
        // Songs cannot have been liked in the future
        disabled: iso > this.todayIso,
        col: (first.getDay() + day - 1) % 7,
        isLastOfMonth: day === daysInMonth
      });
    }
    return { year, month, cells };
  }
}
