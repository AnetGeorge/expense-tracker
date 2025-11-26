import ChartCard from '../components/ChartCard';

export default {
  title: 'Components/ChartCard',
  component: ChartCard,
};

export const Default = (args) => <ChartCard {...args} />;
Default.args = {
  title: 'Sample Chart',
  data: [
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 200 },
    { name: 'Mar', value: 150 },
  ],
};
