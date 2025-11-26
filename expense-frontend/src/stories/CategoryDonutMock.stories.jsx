import React, { useEffect } from 'react';
import CategoryDonut from '../components/CategoryDonut';
// no direct api import; we mock global fetch instead for Storybook

export default {
  title: 'Components/CategoryDonut',
  component: CategoryDonut,
};

const mockCategories = [
  { categoryId: '1', name: 'Travel' },
  { categoryId: '2', name: 'Food' },
  { categoryId: '3', name: 'Supplies' },
  { categoryId: '4', name: 'Other' },
];

const mockExpensesByStatus = {
  pending: [
    { categoryId: '1', amount: 120 },
    { categoryId: '2', amount: 80 },
  ],
  approved: [
    { categoryId: '1', amount: 200 },
    { categoryId: '3', amount: 200 },
  ],
  rejected: [
    { categoryId: '4', amount: 100 },
  ],
};

export const Default = (args) => {
  useEffect(() => {
    // mock global fetch used by api.apiFetch
    const originalFetch = window.fetch;
    window.fetch = async (input) => {
      const path = typeof input === 'string' ? input : input.url;
      if (path.includes('/api/categories')) {
        return { ok: true, json: async () => mockCategories, headers: new Headers({ 'content-type': 'application/json' }) };
      }
      if (path.includes('/api/expenses/status')) {
        // infer status from path
        const parts = path.split('/');
        const status = parts[parts.length - 1].split('?')[0];
        return { ok: true, json: async () => (mockExpensesByStatus[status] || []), headers: new Headers({ 'content-type': 'application/json' }) };
      }
      return { ok: true, json: async () => [] };
    };

    // set a fake user in localStorage so component uses dept fallback
    const prev = localStorage.getItem('user');
    localStorage.setItem('user', JSON.stringify({ departmentId: null }));

    return () => {
      window.fetch = originalFetch;
      if (prev == null) localStorage.removeItem('user'); else localStorage.setItem('user', prev);
    };
  }, []);

  return (
    <div style={{ width: 420, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CategoryDonut {...args} />
    </div>
  );
};

Default.storyName = 'Default';
