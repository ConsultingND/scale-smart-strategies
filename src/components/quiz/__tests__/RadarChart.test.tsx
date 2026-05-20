import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import RadarChart from '../RadarChart';

const dims = [
  { id: 'a', label: 'Alpha', score: 0.2 },
  { id: 'b', label: 'Bravo', score: 0.4 },
  { id: 'c', label: 'Charlie', score: 0.6 },
  { id: 'd', label: 'Delta', score: 0.8 },
  { id: 'e', label: 'Echo', score: 1 },
];

describe('RadarChart', () => {
  it('renders a labeled SVG with one vertex circle per dimension', () => {
    const { container } = render(<RadarChart dimensions={dims} title="Test" />);
    const svg = container.querySelector('svg[role="img"]');
    expect(svg).not.toBeNull();
    const circles = container.querySelectorAll('svg circle');
    expect(circles.length).toBe(dims.length);
    // Axis labels rendered (appear in both the SVG and the sr-only summary table)
    for (const d of dims) {
      expect(screen.getAllByText(d.label).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders a screen-reader table with rounded scores', () => {
    render(<RadarChart dimensions={dims} title="Test" />);
    const table = screen.getByRole('table', { hidden: true });
    const utils = within(table);
    expect(utils.getByText('Alpha')).toBeInTheDocument();
    expect(utils.getByText('20')).toBeInTheDocument();
    expect(utils.getByText('100')).toBeInTheDocument();
  });

  it('returns null for too-few dimensions', () => {
    const { container } = render(<RadarChart dimensions={dims.slice(0, 2)} />);
    expect(container.querySelector('svg')).toBeNull();
  });
});
