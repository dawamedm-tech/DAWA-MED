import React from 'react';
import { CustomerHome, CustomerHomeProps } from './customer/CustomerHome';

export const CustomerView: React.FC<CustomerHomeProps> = (props) => {
  return <CustomerHome {...props} />;
};

export default CustomerView;
