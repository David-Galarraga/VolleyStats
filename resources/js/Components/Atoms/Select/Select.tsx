import React, { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', children, ...rest }, ref) => (
        <select
            ref={ref}
            className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 disabled:bg-gray-100 disabled:text-gray-400 ${className}`.trim()}
            {...rest}
        >
            {children}
        </select>
    )
);

Select.displayName = 'Select';

export default Select;
