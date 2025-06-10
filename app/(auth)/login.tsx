import { LoginPage } from '@/features/auth';
import React from 'react';

const Login = (props: any) => {
  console.log('Rendering Login');
  return (
    <>
      <LoginPage {...props} />
    </>
  );
};

export default Login;
