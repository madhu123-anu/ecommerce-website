import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-700 border border-slate-200 dark:border-slate-600 rounded-xl p-3 shadow-xl">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="text-sm font-bold">
            {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data = [] }) {
  return (
    <div className="card p-6">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip prefix="$" />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#9333ea"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={{ fill: '#9333ea', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#9333ea', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersBarChart({ data = [] }) {
  return (
    <div className="card p-6">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Orders by Month</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="orders"
            fill="#9333ea"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SalesChart({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RevenueChart data={data} />
      <OrdersBarChart data={data} />
    </div>
  );
}
