import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      
      {/* Ancient Runes Background (Static, no rotation animation) */}
      

      <div className="relative z-10 max-w-4xl mt-36 md:mt-52 lg:mt-64">
        {/* Smile replaced with user provided Giphy GIF - positioned lower and styled circularly */}
        <div className="flex items-center justify-center mt-16 mb-2">
          <div className="w-20 h-20 rounded-full border-2 border-[#d4af37] overflow-hidden bg-[#120e0c]/60 p-1 flex items-center justify-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            <img 
              src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmw1bTFiNWIzOXBnYXQwcWlhajZvM3p6ZXJ5ZWowdXgzNXE1bHZiNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/ekD3PpqqhxTgsJKoGB/giphy.gif" 
              alt="Dancing Smiley" 
              className="w-full h-full object-cover rounded-full select-none pointer-events-none" 
              referrerPolicy="no-referrer" 
            />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display text-white mb-6 tracking-tight leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Build Your Own <br />
          <span className="text-[#ff4444] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold">Fantasy Adventure</span>
        </h1>

        {/* Highly readable, non-transparent statement background */}
        <div className="mb-12 max-w-2xl mx-auto">
          <p className="inline-block text-xs md:text-base lg:text-lg text-[#8a1212] font-serif leading-relaxed font-bold bg-[#faf6eb] px-6 py-3 rounded-2xl border border-[#d4af37]/60 shadow-md">
            Upload images or choose dynamic templates and transform them into interactive learning boards—the ultimate canvas to explore, build, and share your ideas.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <motion.button
            onClick={onStart}
            animate={{
              boxShadow: [
                "0 0 0px rgba(212, 175, 55, 0.2)",
                "0 0 15px rgba(212, 175, 55, 0.7)",
                "0 0 0px rgba(212, 175, 55, 0.2)"
              ],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ 
              scale: 1.08,
              boxShadow: "0 0 25px rgba(212, 175, 55, 0.95)",
            }}
            whileTap={{ scale: 0.96 }}
            className="group relative px-10 py-5 bg-fantasy-gold text-[#1a130b] font-serif font-black text-xl rounded-xl overflow-hidden cursor-pointer selection:bg-transparent"
          >
            {/* Live glowing backdrop gradient layer inside button */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />
            
            {/* Moving active glare across the button */}
            <motion.div 
              animate={{
                x: ['-150%', '250%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1
              }}
              className="absolute top-0 bottom-0 w-2/5 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
            />

            <span className="relative flex items-center gap-2">
              Start Creating 
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronRight className="w-6 h-6 stroke-[3px]" />
              </motion.span>
            </span>
          </motion.button>
        </div>
      </div>

    </div>
  );
};
