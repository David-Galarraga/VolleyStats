import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-yellow-400 bg-yellow-50 text-primary focus:border-yellow-400 focus:bg-yellow-100 focus:text-primary'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 focus:border-slate-300 focus:bg-slate-50 focus:text-slate-700'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
