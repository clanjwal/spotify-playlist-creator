import { formatDuration, pageItems } from './tracks';

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(65_000)).toBe('1:05');
    expect(formatDuration(0)).toBe('0:00');
  });

  it('adds hours for long tracks', () => {
    expect(formatDuration(3_725_000)).toBe('1:02:05');
  });
});

describe('pageItems', () => {
  it('lists every page when there are few', () => {
    expect(pageItems(1, 3)).toEqual([1, 2, 3]);
  });

  it('collapses distant pages into ellipses around the current page', () => {
    expect(pageItems(10, 20)).toEqual([1, null, 9, 10, 11, null, 20]);
    expect(pageItems(1, 20)).toEqual([1, 2, null, 20]);
  });

  it('shows a lone skipped page instead of an ellipsis', () => {
    expect(pageItems(4, 9)).toEqual([1, 2, 3, 4, 5, null, 9]);
  });
});
