import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { applyGuards, type TGuards } from '@/helpers';

import { Loading } from '../Loading';

export interface IRoleBasedView {
  component: any;
  guards: TGuards;
}

export const RoleBasedView = function ({ component, guards }: IRoleBasedView) {
  const router = useRouter();
  const [canAccessScreen, setCanAccessScreen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    applyGuards(guards, router)
      .then((value) => {
        if (isMounted) {
          setCanAccessScreen(value);
        }
      })
      .catch((_) => {
        if (isMounted) {
          setCanAccessScreen(false);
          if (router.canGoBack()) {
            router.back();
          }
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return <>{!canAccessScreen ? <Loading /> : component({ router })}</>;
};
