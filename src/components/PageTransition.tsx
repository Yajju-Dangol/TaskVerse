import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export const PageTransition = ({ children, className }: { children: ReactNode; className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, filter: 'blur(5px)', scale: 0.9 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(5px)', scale: 0.9 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className={className}
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
};
