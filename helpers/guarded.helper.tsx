import { type Router } from 'expo-router';

export type TGuards = ((router: Router) => Promise<any>)[];

export const applyGuards = async (
  guards: TGuards,
  router: Router
): Promise<boolean> => {
  if (guards && Array.isArray(guards) && guards.length > 0) {
    try {
      const results = [];
      for (const guard of guards) {
        results.push(await guard(router));
      }
      return results.reduce((a, b) => a && b, true);
    } catch (e) {
      return false;
    }
  } else {
    return true;
  }
};
