import ManagerActionModal from '../components/ManagerActionModal';

export default {
  title: 'Components/ManagerActionModal',
  component: ManagerActionModal,
};

export const Default = (args) => <ManagerActionModal {...args} />;
Default.args = {
  open: true,
  onClose: () => {},
  expense: { id: 1, employeeName: 'Alice', amount: 100, status: 'Pending' },
};
