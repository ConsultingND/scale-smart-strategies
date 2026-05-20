import type { ScoreDimension } from './types';

type Props = {
  dimensions: ScoreDimension[];
  title?: string;
  size?: number;
};

/**
 * Pure-SVG radar chart. Each dimension's score (0..1) maps to a radial offset
 * from the center. Includes accessible <title>, <desc>, and a screen-reader
 * table summarizing the values.
 */
export default function RadarChart({ dimensions, title = 'Score', size = 320 }: Props) {
  if (dimensions.length < 3) {
    return null;
  }
  const center = size / 2;
  const radius = (size / 2) * 0.82;

  const angleFor = (i: number) => (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;

  const axisPoint = (i: number, scale = 1) => {
    const a = angleFor(i);
    return [center + Math.cos(a) * radius * scale, center + Math.sin(a) * radius * scale];
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
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="mx-auto"
      >
        <title>{title}</title>
        <desc>
          Radar chart showing scores for {dimensions.map((d) => d.label).join(', ')}.
        </desc>

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
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#DADCDD" strokeWidth={1} />;
        })}

        {/* Score polygon */}
        <polygon points={polygon} fill="rgba(11,30,63,0.35)" stroke="#0B1E3F" strokeWidth={2} />

        {/* Vertex markers */}
        {dimensions.map((d, i) => {
          const [x, y] = axisPoint(i, Math.max(0.04, Math.min(1, d.score)));
          return <circle key={d.id} cx={x} cy={y} r={4} fill="#0B1E3F" />;
        })}

        {/* Axis labels */}
        {dimensions.map((d, i) => {
          const [x, y] = axisPoint(i, 1.12);
          const anchor = x < center - 4 ? 'end' : x > center + 4 ? 'start' : 'middle';
          return (
            <text
              key={`label-${d.id}`}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={12}
              fill="#1A3A5F"
              fontWeight={600}
            >
              {d.label}
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
