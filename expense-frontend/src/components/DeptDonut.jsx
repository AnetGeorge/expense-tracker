import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { apiFetch } from '../lib/api';
import '../styles/dashboard.css';

const COLORS = ['#FF7A00', '#7C4DFF', '#FF4D6D', '#00C49F', '#0088FE', '#FFA726'];

export default function DeptDonut() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // load departments
        const deptsRes = await apiFetch('/api/departments');
        const depts = Array.isArray(deptsRes) ? deptsRes : deptsRes?.body || [];

        const results = [];
        let grand = 0;
        for (let i = 0; i < depts.length; i++) {
          const d = depts[i];
          let list = [];
          try {
            const res = await apiFetch(`/api/expenses/status/approved?departmentId=${d.departmentId}`);
            list = Array.isArray(res) ? res : res?.body || [];
          } catch {
            // no data -> empty
            list = [];
          }
          const sum = (list || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
          if (sum > 0) {
            results.push({ name: d.name, value: sum });
            grand += sum;
          }
        }

        if (mounted) {
          setData(results);
          setTotal(grand);
        }
      } catch (err) {
        console.error('DeptDonut load failed', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!data || data.length === 0) {
    return <div style={{ color: '#999' }}>No department data</div>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PieChart width={260} height={220}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
      <div style={{ position: 'relative', marginLeft: -140 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#666' }}>Total</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>₹{total}</div>
        </div>
      </div>
    </div>
  );
}
