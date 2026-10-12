import { TestBed } from '@angular/core/testing';
import { DateRangePicker } from './date-range-picker';

describe('DateRangePicker', () => {
  async function render() {
    await TestBed.configureTestingModule({ imports: [DateRangePicker] }).compileComponents();
    const fixture = TestBed.createComponent(DateRangePicker);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const type = async (id: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    return { fixture, el, type, picker: fixture.componentInstance };
  }

  it('accepts dates typed with the keyboard and shows them on the calendar', async () => {
    const { el, type, picker } = await render();
    await type('range-start', '2024-03-05');
    await type('range-end', '2024-03-20');

    expect(picker.start()).toBe('2024-03-05');
    expect(picker.end()).toBe('2024-03-20');
    expect(el.querySelector('select')!.selectedOptions[0].textContent).toContain(
      new Date(2024, 2, 1).toLocaleDateString(undefined, { month: 'long' })
    );
    // 14 days sit between the two ends, each with a continuous band behind it
    expect(el.querySelectorAll('span.bg-green-500\\/20').length).toBeGreaterThanOrEqual(14);
  });

  it('swaps the dates when the end is typed before the start', async () => {
    const { type, picker } = await render();
    await type('range-start', '2024-03-20');
    await type('range-end', '2024-03-05');

    expect(picker.start()).toBe('2024-03-05');
    expect(picker.end()).toBe('2024-03-20');
  });

  it('ignores future dates and clears a field that is emptied', async () => {
    const { type, picker } = await render();
    await type('range-start', '2999-01-01');
    expect(picker.start()).toBeNull();

    await type('range-start', '2024-03-05');
    await type('range-start', '');
    expect(picker.start()).toBeNull();
  });

  it('jumps to the chosen month and year from the dropdowns', async () => {
    const { el, fixture } = await render();
    const [month, year] = Array.from(el.querySelectorAll<HTMLSelectElement>('select'));
    year.value = '2020';
    year.dispatchEvent(new Event('change'));
    month.value = '5';
    month.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(el.querySelector('button[aria-label^="Jun 1, 2020"]')).not.toBeNull();
  });
});
