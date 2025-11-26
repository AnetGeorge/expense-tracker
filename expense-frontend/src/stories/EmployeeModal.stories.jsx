import EmployeeModal from '../components/EmployeeModal';

export default {
  title: 'Components/EmployeeModal',
  component: EmployeeModal,
};

export const Default = (args) => <EmployeeModal {...args} />;
Default.args = {
  open: true,
  onClose: () => {},
  initial: { name: 'Alice', email: 'alice@example.com', departmentId: 1 },
};
