'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientTitleProps {
  line1: string;
  line2: string;
  className?: string;
}

export default function GradientTitle({ line1, line2, className }: GradientTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={cn('text-center', className)}
    >
      <h1 className="font-montserrat font-extrabold tracking-tight">
        <span className="gradient-text text-4xl md:text-5xl lg:text-6xl block">
          {line1}
        </span>
        <span className="gradient-text text-4xl md:text-5xl lg:text-6xl block mt-1">
          {line2}
        </span>
      </h1>
    </motion.div>
  );
}
