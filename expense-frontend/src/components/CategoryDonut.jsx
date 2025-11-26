import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { apiFetch } from '../lib/api';

const COLORS = ['#00727aff', '#389b9bff', '#1ac2ceff', '#249a9eff', '#0088FE', '#FFA726', '#A1887F', '#4DB6AC'];

export default function CategoryDonut({ departmentId: propDept }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const userJson = localStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        const deptId = propDept != null ? propDept : (user?.departmentId || null);

        // load categories to map ids -> names
        let cats = [];
        try {
          const cRes = await apiFetch('/api/categories');
          cats = Array.isArray(cRes) ? cRes : cRes?.body || [];
        } catch {
          cats = [];
        }

        // fetch expenses for common statuses and combine
        const statuses = ['pending', 'approved', 'rejected'];
        let all = [];
        for (const s of statuses) {
          try {
            const url = deptId ? `/api/expenses/status/${encodeURIComponent(s)}?departmentId=${deptId}` : `/api/expenses/status/${encodeURIComponent(s)}`;
            const res = await apiFetch(url);
            const list = Array.isArray(res) ? res : res?.body || [];
            all = all.concat(list || []);
          } catch {
            // ignore missing status
          }
        }

        // aggregate amounts per categoryId
        const sums = {};
        let grand = 0;
        for (const e of all) {
          const cid = e.categoryId || 'uncategorized';
          const amt = Number(e.amount) || 0;
          sums[cid] = (sums[cid] || 0) + amt;
          grand += amt;
        }

        const out = Object.keys(sums).map((k) => {
          const cat = cats.find((c) => c.categoryId === k) || cats.find((c) => String(c.categoryId) === String(k));
          const name = cat ? cat.name : (k === 'uncategorized' ? 'Uncategorized' : String(k));
          return { name, value: sums[k] };
        }).sort((a,b) => b.value - a.value);

        if (mounted) {
          setData(out);
          setTotal(grand);
        }
      } catch (err) {
        console.error('CategoryDonut load failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [propDept]);

  if (loading) return <div style={{ color: '#666' }}>Loading...</div>;
  if (!data || data.length === 0) return <div style={{ color: '#999' }}>No category data</div>;

  // compute percent labels
  const withPct = data.map((d) => ({ ...d, pct: total > 0 ? Math.round((d.value / total) * 100) : 0 }));

return (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <PieChart width={400} height={260}>
      <Pie
        data={withPct}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius={70}
        outerRadius={100}
        paddingAngle={2}
      >
        {withPct.map((entry, idx) => (
          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
        ))}
      </Pie>

      <Tooltip
        formatter={(val, name, props) => [`₹${val}`, `${props.payload.name} (${props.payload.pct}%)`]}
      />

      <Legend
        layout="vertical"
        verticalAlign="middle"
        align="right"
      />
    </PieChart>
  </div>
);

}
