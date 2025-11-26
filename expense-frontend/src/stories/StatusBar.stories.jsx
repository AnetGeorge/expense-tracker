import StatusBar from '../components/StatusBar';

export default {
  title: 'Components/StatusBar',
  component: StatusBar,
};

const mockExpenses = [
  { date: '2023-11-01', status: 'Approved' },
  { date: '2023-11-02', status: 'Pending' },
  { date: '2023-11-03', status: 'Rejected' },
  { date: '2023-11-04', status: 'Approved' },
  { date: '2023-11-05', status: 'Pending' },
  { date: '2023-11-06', status: 'Pending' },
  { date: '2023-11-07', status: 'Rejected' },
];

export const Default = (args) => <StatusBar {...args} />;
Default.args = {
  expenses: mockExpenses,
};
