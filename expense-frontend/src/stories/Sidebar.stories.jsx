import { MemoryRouter } from "react-router-dom";
import Sidebar from '../components/Sidebar';

export default {
  title: 'Components/Sidebar',
  component: Sidebar,
};

export const Default = (args) => (
  <MemoryRouter>
    <Sidebar {...args} />
  </MemoryRouter>
);
Default.args = {};