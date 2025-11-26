import EmployeeCards from '../components/EmployeeCards';

export default {
  title: 'Components/EmployeeCards',
  component: EmployeeCards,
};

export const Default = (args) => <EmployeeCards {...args} />;
Default.args = {};
