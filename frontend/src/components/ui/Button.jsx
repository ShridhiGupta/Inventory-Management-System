import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const buttonVariants = {
  default: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border-2 border-slate-600 bg-slate-900 hover:bg-slate-800 hover:text-white',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600',
  ghost: 'hover:bg-slate-800 hover:text-white',
  link: 'text-cyan-400 underline-offset-4 hover:underline',
};

const sizeVariants = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Comp
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          buttonVariants[variant],
          sizeVariants[size],
          className
        )}
        ref={ref}
        {...props}
      />
    </motion.div>
  );
});

Button.displayName = 'Button';

export { Button };
