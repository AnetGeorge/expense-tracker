import ExpenseModal from '../components/ExpenseModal';

export default {
  title: 'Components/ExpenseModal',
  component: ExpenseModal,
};

export const Default = (args) => <ExpenseModal {...args} />;
Default.args = {
  onClose: () => {},
  open: true,
};
