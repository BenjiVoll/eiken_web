import React from 'react';

// Componente Input reutilizable
const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  icon = null,
  ...props
}) => {
  const inputClasses = `form-input ${error ? 'error' : ''} ${icon ? 'pl-10' : ''} ${inputClassName}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
      </div>

      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
};

export default Input;
