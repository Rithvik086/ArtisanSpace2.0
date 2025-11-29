import { Outlet } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="grow">
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
};

export default CustomerLayout;