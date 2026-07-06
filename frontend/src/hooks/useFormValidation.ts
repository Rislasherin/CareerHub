import { useState, useCallback, useMemo } from 'react';

export function useFormValidation<T extends Record<string, any>>(
  values: T,
  validateFn: (values: T) => Record<string, string>
) {
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const allErrors = useMemo(() => validateFn(values), [values, validateFn]);

  const currentErrors: Record<string, string> = {};
  Object.keys(allErrors).forEach((key) => {
    const value = values[key];
    const isNotEmpty = typeof value === 'string' ? value.trim() !== '' : 
                       Array.isArray(value) ? value.length > 0 : 
                       value !== undefined && value !== null;
                       
    // Show error if touched (blur/change), OR if it has a value (typing invalid data), OR form is submitted
    if (touchedFields[key] || isNotEmpty || isSubmitted) {
      currentErrors[key] = allErrors[key];
    }
  });

  const isValid = Object.keys(allErrors).length === 0;

  const handleTouch = useCallback((field: string) => {
    setTouchedFields(prev => prev[field] ? prev : { ...prev, [field]: true });
  }, []);

  const getCaptureProps = useCallback(() => ({
    onBlurCapture: (e: React.FocusEvent<any>) => {
      if (e.target.name) handleTouch(e.target.name);
    },
    onChangeCapture: (e: React.ChangeEvent<any>) => {
      if (e.target.name) handleTouch(e.target.name); 
    }
  }), [handleTouch]);

  const handleSubmit = useCallback((onSubmit: () => void | Promise<void>) => {
    return async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setIsSubmitted(true);
      if (Object.keys(validateFn(values)).length === 0) {
        await onSubmit();
      }
    };
  }, [values, validateFn]);

  const resetValidation = useCallback(() => {
    setTouchedFields({});
    setIsSubmitted(false);
  }, []);

  return {
    errors: currentErrors,
    isValid,
    getCaptureProps,
    handleSubmit,
    resetValidation,
    isSubmitted,
    handleTouch
  };
}
