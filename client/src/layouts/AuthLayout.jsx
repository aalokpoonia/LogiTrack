/**
 * layouts/AuthLayout.jsx
 *
 * Layout wrapper for Login and Register pages.
 * Centers a glassmorphism card on the dark background.
 */

import { motion } from 'framer-motion';

const AuthLayout = ({ children }) => {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: '#0A0F1E' }}
        >
            {/* Background decorative orbs — glassmorphism ambient lighting */}
            <div
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #1d4ed8 0%, transparent 70%)' }}
            />
            <div
                className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
            />
            <div
                className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}
            />

            {/* Animated card container */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default AuthLayout;
