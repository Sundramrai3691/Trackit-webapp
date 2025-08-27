// BoltPatch: Reusable glass card component
import React from 'react';
import { motion } from 'framer-motion';

export default function CardGlass({ 
  children, 
  className = '', 
  hover = true, 
  animate = true,
  ...props 
}) {
  const Component = animate ? motion.div : 'div';
  
  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileHover: hover ? { y: -2, scale: 1.02 } : undefined,
    transition: { duration: 0.3 }
  } : {};

  return (
    <Component
      className={`glass-card ${hover ? 'hover:shadow-xl' : ''} transition-all duration-300 ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}