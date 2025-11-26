import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// Show stacked bar per date with counts for approved/pending/rejected
export default function StatusBar({ expenses }) {
  // Helper to format date into short label (e.g. '7 Jan')
  const fmt = (raw) => {
    if (!raw) return "";
    const d = new Date(raw);
    if (!isNaN(d)) {
      return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    }
    return String(raw);
  };

  // Aggregation with display scaling: raw counts saved as *_raw, displayed values scaled
  const data = useMemo(() => {
    const dateMap = new Map();
    const map = {};
    const SCALES = { approved: 1.0, pending: 0.6, rejected: 0.2 };

    (expenses || []).forEach((e) => {
      const raw = e.date || "";
      const label = fmt(raw);
      const ts = new Date(raw).getTime() || 0;
      if (!dateMap.has(label) || ts < dateMap.get(label)) dateMap.set(label, ts);
      if (!map[label]) map[label] = { name: label, approved_raw: 0, pending_raw: 0, rejected_raw: 0 };
      const s = (e.status || "").toLowerCase();
      if (s.includes("approve")) map[label].approved_raw += 1;
      else if (s.includes("reject") || s.includes("decline")) map[label].rejected_raw += 1;
      else map[label].pending_raw += 1;
    });

    const dateList = Array.from(dateMap.entries())
      .sort((a, b) => (a[1] || 0) - (b[1] || 0))
      .map((entry) => entry[0]);

    return dateList.map((d) => {
      const row = map[d] || { name: d, approved_raw: 0, pending_raw: 0, rejected_raw: 0 };
      return {
        name: row.name,
        approved_raw: row.approved_raw,
        pending_raw: row.pending_raw,
        rejected_raw: row.rejected_raw,
        // scaled values control bar heights
        approved: +(row.approved_raw * SCALES.approved).toFixed(2),
        pending: +(row.pending_raw * SCALES.pending).toFixed(2),
        rejected: +(row.rejected_raw * SCALES.rejected).toFixed(2),
      };
    });
  }, [expenses]);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 16 }} className="chart-card">
        <div style={{ color: "#777" }}>No expense data to render chart.</div>
      </div>
    );
  }

  return (
    <div className="card chart-card1" style={{ marginBottom: 18 }}>
      <h3 style={{ marginTop: 0 }}>Submitted requests by date</h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }} barSize={100}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value, name, props) => {
              // Show raw count in tooltip if available
              const payload = props && props.payload ? props.payload : {};
              const rawKey = `${name}_raw`;
              const raw = payload && payload[rawKey] != null ? payload[rawKey] : value;
              return [raw, name];
            }} />
            <Legend />
            {/* Render rejected first (bottom), then pending (single color), then approved on top */}
            <Bar dataKey="rejected" stackId="a" fill="#03768A  " radius={[6, 6, 0, 0]}/>
            <Bar dataKey="pending" stackId="a" fill="#2da1acff" radius={[6, 6, 0, 0]}/>
            <Bar dataKey="approved" stackId="a" fill="#80CECF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
