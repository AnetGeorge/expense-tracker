import React from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function ChartCard({ title, data }) {
  return (
    <div className="card chart-card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>

            {/* 🌈 Gradient Definition */}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#67B9C0" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#95D2D7" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#DEF2F4" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            {/* Area (gradient) + Line overlay */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="url(#colorGradient)"
              fillOpacity={0.65}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#0f8192"
              strokeWidth={2}
              dot={{ r: 2 }}
            />

          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
