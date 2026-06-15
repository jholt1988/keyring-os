/**
 * Reusable form validation hooks for Keyring-OS
 */

import { useState, useCallback } from 'react';

export interface ValidationRule<T> {
  validator: (value: T, form?: Record<string, any>) => boolean | string;
  message: string;
}

export interface FieldValidation<T> {
  value: T;
  rules: ValidationRule<T>[];
  touched: boolean;
  error?: string;
}

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule<any>[]>>,
  options: UseFormValidationOptions = {}
) {
  const { validateOnChange = true, validateOnBlur = true } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Set<keyof T>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: keyof T, value: any): string | null => {
    const fieldRules = validationRules[field];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const result = rule.validator(value, values);
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message;
      }
    }
    
    return null;
  }, [values, validationRules]);

  const validateForm = useCallback((): Partial<Record<keyof T, string>> => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    Object.keys(validationRules).forEach((field) => {
      const fieldKey = field as keyof T;
      const error = validateField(fieldKey, values[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
      }
    });
    
    return newErrors;
  }, [values, validationRules, validateField]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange) {
      const error = validateField(field, value);
      setErrors(prev => {
        const next = { ...prev };
        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }
        return next;
      });
    }
    
    setTouched(prev => new Set([...prev, field]));
  }, [validateField, validateOnChange]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => new Set([...prev, field]));
    
    if (validateOnBlur) {
      const error = validateField(field, values[field]);
      setErrors(prev => {
        const next = { ...prev };
        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }
        return next;
      });
    }
  }, [validateField, validateOnBlur, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched(new Set());
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    handleChange(field, value);
  }, [handleChange]);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => {
      const next = new Set(prev);
      if (isTouched) {
        next.add(field);
      } else {
        next.delete(field);
      }
      return next;
    });
  }, []);

  const hasErrors = Object.keys(errors).length > 0;
  const isTouched = touched.size > 0;
  const isValid = !hasErrors && isTouched;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    hasErrors,
    isTouched,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
    validateForm,
    validateField,
    resetForm,
    setErrors,
    setIsSubmitting,
    setValues
  };
}

// Common validation rules
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule<any> => ({
    validator: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validator: (value) => typeof value === 'string' && value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validator: (value) => typeof value === 'string' && value.length <= max,
    message: message || `Must be at most ${max} characters`
  }),
  
  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validator: (value) => {
      if (!value) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),
  
  password: (message = 'Password does not meet requirements'): ValidationRule<string> => ({
    validator: (value) => {
      if (!value) return false;
      return value.length >= 8 && 
             /[A-Z]/.test(value) && 
             /[a-z]/.test(value) && 
             /\d/.test(value) && 
             /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    },
    message
  }),
  
  matchField: (fieldName: string, message?: string): ValidationRule<string> => ({
    validator: (value, form) => value === form?.[fieldName],
    message: message || 'Fields do not match'
  }),
  
  numeric: (message = 'Must be a number'): ValidationRule<any> => ({
    validator: (value) => !isNaN(parseFloat(value)) && isFinite(value),
    message
  }),
  
  minValue: (min: number, message?: string): ValidationRule<number> => ({
    validator: (value) => value >= min,
    message: message || `Must be at least ${min}`
  }),
  
  maxValue: (max: number, message?: string): ValidationRule<number> => ({
    validator: (value) => value <= max,
    message: message || `Must be at most ${max}`
  }),
  
  regex: (pattern: RegExp, message: string): ValidationRule<string> => ({
    validator: (value) => pattern.test(value),
    message
  }),
  
  phone: (message = 'Please enter a valid phone number'): ValidationRule<string> => ({
    validator: (value) => {
      if (!value) return false;
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    },
    message
  })
};

// Helper to create field configurations
export function createFieldConfig<T extends Record<string, any>>(
  rules: ValidationRule<any>[],
  defaultValue: any
) {
  return { rules, defaultValue };
}