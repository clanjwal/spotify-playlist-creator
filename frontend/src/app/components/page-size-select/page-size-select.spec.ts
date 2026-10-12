import { TestBed } from '@angular/core/testing';
import { PageSizeSelect } from './page-size-select';

describe('PageSizeSelect', () => {
  async function render(max = 0) {
    await TestBed.configureTestingModule({ imports: [PageSizeSelect] }).compileComponents();
    const fixture = TestBed.createComponent(PageSizeSelect);
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('options', [20, 50, 75, 100]);
    fixture.componentRef.setInput('max', max);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const sizes: number[] = [];
    fixture.componentInstance.sizeChange.subscribe(size => sizes.push(size));
    return { fixture, el, sizes, field: el.querySelector<HTMLInputElement>('input')! };
  }

  it('lists the suggested sizes when the dropdown is opened and applies the one clicked', async () => {
    const { fixture, el, sizes, field } = await render();
    expect(el.querySelector('[role="listbox"]')).toBeNull();

    el.querySelector<HTMLButtonElement>('button[aria-label="Show page size options"]')!.click();
    await fixture.whenStable();
    const options = Array.from(el.querySelectorAll<HTMLButtonElement>('[role="option"] button'));
    expect(options.map(o => o.textContent!.trim())).toEqual(['20', '50', '75', '100']);

    options[2].click();
    await fixture.whenStable();
    expect(sizes).toEqual([75]);
    expect(field.value).toBe('75');
    expect(el.querySelector('[role="listbox"]')).toBeNull();
  });

  it('accepts any typed number and strips anything that is not a digit', async () => {
    const { field, sizes } = await render();
    field.value = '3x7';
    field.dispatchEvent(new Event('input'));

    expect(field.value).toBe('37');
    expect(sizes).toEqual([37]);
  });

  it('shows the song count when a larger number is typed', async () => {
    const { field, sizes } = await render(30);
    field.value = '500';
    field.dispatchEvent(new Event('input'));

    expect(field.value).toBe('30');
    expect(sizes).toEqual([500]);
  });

  it('puts the size in use back when the field is left empty', async () => {
    const { field, sizes } = await render();
    field.value = '';
    field.dispatchEvent(new Event('input'));
    expect(sizes).toEqual([]);

    field.dispatchEvent(new Event('blur'));
    expect(field.value).toBe('50');
  });
});
