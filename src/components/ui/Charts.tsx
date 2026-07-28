import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid rgb(var(--color-border))',
  backgroundColor: 'rgb(var(--color-surface))',
  color: 'rgb(var(--color-text))',
  fontSize: 12,
  padding: '8px 12px',
} as const;

interface SeriesPoint {
  label: string;
  value: number;
}

export function AreaTrend({ data, color = '#3b82f6', height = 200 }: { data: SeriesPoint[]; color?: string; height?: number }) {
  return (
    <div className="w-full overflow-x-auto">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" vertical={false} />
          <XAxis dataKey="label" stroke="rgb(var(--color-text-muted))" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: color, strokeWidth: 1 }} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${color})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineTrend({ data, color = '#3b82f6', height = 200 }: { data: SeriesPoint[]; color?: string; height?: number }) {
  return (
    <div className="w-full overflow-x-auto">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" vertical={false} />
          <XAxis dataKey="label" stroke="rgb(var(--color-text-muted))" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: color, strokeWidth: 1 }} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarCompare({ data, color = '#3b82f6', height = 220 }: { data: SeriesPoint[]; color?: string; height?: number }) {
  return (
    <div className="w-full overflow-x-auto">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" vertical={false} />
          <XAxis dataKey="label" stroke="rgb(var(--color-text-muted))" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgb(var(--color-border) / 0.3)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function DonutChart({ data, height = 220 }: { data: { label: string; value: number }[]; height?: number }) {
  return (
    <div className="w-full overflow-x-auto">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RadarSkills({ data, height = 280 }: { data: { label: string; value: number }[]; height?: number }) {
  return (
    <div className="w-full overflow-x-auto">
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="rgb(var(--color-border))" />
          <PolarAngleAxis dataKey="label" tick={{ fill: 'rgb(var(--color-text-muted))', fontSize: 11 }} />
          <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
