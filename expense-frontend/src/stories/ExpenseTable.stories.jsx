import ExpenseTable from '../components/ExpenseTable';

export default {
  title: 'Components/ExpenseTable',
  component: ExpenseTable,
};

const mockExpenses = [
  { id: 1, employeeName: 'Alice', dept: 'HR', category: 'Travel', amount: 120, date: '2023-11-01', status: 'Approved' },
  { id: 2, employeeName: 'Bob', dept: 'IT', category: 'Food', amount: 80, date: '2023-11-02', status: 'Pending' },
  { id: 3, employeeName: 'Charlie', dept: 'Finance', category: 'Supplies', amount: 200, date: '2023-11-03', status: 'Rejected' },
];

export const Default = (args) => <ExpenseTable {...args} />;
Default.args = {
  expenses: mockExpenses,
};
