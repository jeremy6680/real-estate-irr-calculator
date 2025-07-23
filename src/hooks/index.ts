import { useState, useEffect } from 'react';

/**
 * Custom hook for handling form input with validation
 */
export const useFormInput = <T>(
  initialValue: T,
  validate?: (value: T) => { isValid: boolean; error?: string }
) => {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const handleChange = (newValue: T) => {
    setValue(newValue);
    setTouched(true);
    
    if (validate) {
      const result = validate(newValue);
      setError(result.isValid ? undefined : result.error);
    }
  };

  return {
    value,
    error,
    touched,
    handleChange,
    reset: () => {
      setValue(initialValue);
      setError(undefined);
      setTouched(false);
    },
  };
};

/**
 * Custom hook for local storage
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
};