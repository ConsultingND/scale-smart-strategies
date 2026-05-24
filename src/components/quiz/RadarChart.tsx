import type { ScoreDimension } from './types';

type Props = {
  dimensions: ScoreDimension[];
  title?: string;
  size?: number;
};

const LABEL_LINE_HEIGHT = 14;

function wrapLabel(label: string, maxCharsPerLine = 14): string[] {
  const words = label.split(/\s+/);
  if (words.length <= 1) return [label];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if ((current + ' ' + word).length > maxCharsPerLine) {
      lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Pure-SVG radar chart. Each dimension's score (0..1) maps to a radial offset
 * from the chart center. The viewBox is intentionally larger than the chart
 * footprint to leave room for axis labels (which can be multi-word).
 *
 * Includes accessible <title>, <desc>, and an sr-only summary table.
 */
export default function RadarChart({ dimensions, title = 'Score', size = 320 }: Props) {
  if (dimensions.length < 3) {
    return null;
  }
  const horizontalPadding = 120;
  const verticalPadding = 40;
  const width = size + horizontalPadding * 2;
  const height = size + verticalPadding * 2;
  const cx = width / 2;
  const cy = height / 2;
  const radius = size / 2;

  const angleFor = (i: number) => (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;

  const axisPoint = (i: number, scale = 1) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * radius * scale, cy + Math.sin(a) * radius * scale];
  };

  const polygon = dimensions
    .map((d, i) => {
      const [x, y] = axisPoint(i, Math.max(0.04, Math.min(1, d.score)));
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <figure className="mx-auto" aria-label={title}>
      <svg
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto w-full max-w-[520px] h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <title>{title}</title>
        <desc>Radar chart showing scores for {dimensions.map((d) => d.label).join(', ')}.</desc>

        {/* Concentric rings */}
        {rings.map((r) => (
          <polygon
            key={r}
            points={dimensions
              .map((_, i) => {
                const [x, y] = axisPoint(i, r);
                return `${x.toFixed(2)},${y.toFixed(2)}`;
              })
              .join(' ')}
            fill="none"
            stroke="#E8EAEB"
            strokeWidth={1}
          />
        ))}

        {/* Axes */}
        {dimensions.map((_, i) => {
          const [x, y] = axisPoint(i);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#DADCDD" strokeWidth={1} />;
        })}

        {/* Score polygon */}
        <polygon points={polygon} fill="rgba(11,30,63,0.35)" stroke="#0B1E3F" strokeWidth={2} />

        {/* Vertex markers */}
        {dimensions.map((d, i) => {
          const [x, y] = axisPoint(i, Math.max(0.04, Math.min(1, d.score)));
          return <circle key={d.id} cx={x} cy={y} r={4} fill="#0B1E3F" />;
        })}

        {/* Axis labels (wrapped to two lines when needed) */}
        {dimensions.map((d, i) => {
          const [x, y] = axisPoint(i, 1.16);
          const anchor = x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle';
          const lines = wrapLabel(d.label);
          const yStart = y - ((lines.length - 1) / 2) * LABEL_LINE_HEIGHT;
          return (
            <text
              key={`label-${d.id}`}
              x={x}
              y={yStart}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={13}
              fill="#1A3A5F"
              fontWeight={600}
            >
              {lines.map((line, li) => (
                <tspan key={li} x={x} dy={li === 0 ? 0 : LABEL_LINE_HEIGHT}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      {/* Screen-reader fallback */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Dimension</th>
            <th scope="col">Score (0–100)</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((d) => (
            <tr key={d.id}>
              <th scope="row">{d.label}</th>
              <td>{Math.round(d.score * 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
