import { Outlet } from 'react-router-dom';

const CustomerLayout = () => {
  return (
    <div>
      {/* Add any customer-specific layout here, like navbar or sidebar */}
      <Outlet />
    </div>
  );
};

export default CustomerLayout;