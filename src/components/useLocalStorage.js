import { useEffect, useMemo, useState } from 'react';
import { loadLS, saveLS } from '../lib/storage';

export function useLocalStorageState(key, initialValue) {
  const initial = useMemo(() => loadLS(key, initialValue), [key]);
  const [state, setState] = useState(initial);

  useEffect(() => {
    saveLS(key, state);
  }, [key, state]);

  return [state, setState];
}
