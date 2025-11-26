import EmployeeTable from '../components/EmployeeTable';

export default {
  title: 'Components/EmployeeTable',
  component: EmployeeTable,
};

const mockEmployees = [
  { id: 1, name: 'Alice', dept: 'HR', email: 'alice@example.com' },
  { id: 2, name: 'Bob', dept: 'IT', email: 'bob@example.com' },
];

export const Default = (args) => <EmployeeTable {...args} />;
Default.args = {
  employees: mockEmployees,
};
