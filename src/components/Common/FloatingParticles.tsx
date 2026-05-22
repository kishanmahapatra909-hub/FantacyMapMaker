import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export const FloatingParticles = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white/20 rounded-full blur-[1px]"
          initial={{ x: `${p.x}%`, y: `${p.y}%`, opacity: 0 }}
          animate={{
            y: ['-10%', '110%'],
            x: [`${p.x}%`, `${p.x + (Math.random() * 10 - 5)}%`],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          style={{ width: p.size, height: p.size }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
    </div>
  );
};
