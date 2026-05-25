import React, { useState, useEffect } from 'react';
import { Hero } from './Hero';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Shield, Map as MapIcon, Layers, Download, Sparkles, X, Mail, Palette, Image, Dices, BookOpen, ArrowUp } from 'lucide-react';

interface LandingViewProps {
  onStart: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'about' | 'support' | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 400);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLinkClick = (link: string) => {
    if (link === 'Chronicles') {
      onStart();
    } else if (link === 'Privacy and Policy' || link === 'Privacy Scrolls') {
      setActiveModal('privacy');
    } else if (link === 'About US' || link === 'The Guild') {
      setActiveModal('about');
    } else if (link === 'Support' || link === 'Pigeon Support') {
      setActiveModal('support');
    }
  };

  return (
    <div className="text-[#e0d8c3] overflow-x-hidden font-sans relative min-h-screen">
      {/* Fixed, fully-visible background image with absolutely no dark overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          //src="https://i.postimg.cc/d3C8pdDM/Main-Page.png" 
          src="https://i.postimg.cc/JnkZvLNm/Main-Page-Lite.webp"
          alt="Main Page Background" 
          className="w-full h-full object-cover object-center select-none"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-10">
        {/* Ultra-thin Navigation Header */}
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2.5 bg-black/40 backdrop-blur-md border-b border-[#3a3022]/30">
          {/* Left Side: Logo and Brand Name */}
          <div className="flex items-center gap-2">
            <img 
              src="https://i.postimg.cc/rpyZ4WwW/Fantacy.png" 
              alt="FantacyMapMaker Logo" 
              className="h-[18px] w-auto select-none rounded-sm"
              referrerPolicy="no-referrer"
            />
            <span className="font-serif text-[13px] font-bold text-fantasy-gold uppercase tracking-[0.15em] select-none">
              FantacyMapMaker
            </span>
          </div>

          {/* Right Side: Links */}
          <nav className="flex items-center gap-6">
            <button 
              onClick={onStart}
              className="text-[#e0d8c3]/85 hover:text-fantasy-gold font-sans text-[11px] font-medium uppercase tracking-wider transition-all cursor-pointer font-bold relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-fantasy-gold hover:after:w-full after:transition-all"
            >
              New Adventure
            </button>
            <button 
              onClick={() => setActiveModal('about')}
              className="text-[#e0d8c3]/85 hover:text-fantasy-gold font-sans text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer"
            >
              About us
            </button>
            <button 
              onClick={() => setActiveModal('support')}
              className="text-[#e0d8c3]/85 hover:text-fantasy-gold font-sans text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>
        </header>

        <Hero onStart={onStart} />
        
        {/* Main Introduction Section */}
        <section className="py-24 px-6 relative z-10 border-b border-[#3a3022] bg-[#161411]">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl text-fantasy-gold uppercase tracking-[0.2em] font-bold drop-shadow">
              Welcome to FantacyMapMaker
            </h2>
            <div className="w-24 h-0.5 bg-fantasy-gold mx-auto my-4 opacity-70"></div>
            <p className="text-stone-300 font-sans text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              Welcome to FantacyMapMaker, the ultimate interactive playground where kids can transform their wildest imaginations into fully playable board games! Whether you want to design a custom map from scratch, upload your own drawings, or jump straight into classic favorites, FantacyMapMaker combines creative design with digital play.
            </p>
            <p className="text-amber-100/90 font-serif text-sm md:text-base italic max-w-2xl mx-auto leading-relaxed border-t border-[#3a3022]/40 pt-4 font-semibold">
              It’s more than just a game maker—it’s an intuitive educational tool where early learners can master alphabets, numbers, and vocabulary through the power of play. Drag, drop, create, and roll the dice!
            </p>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-24 px-6 relative z-10 border-b border-[#3a3022] bg-[#0f0d0b]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-2xl md:text-3xl text-fantasy-gold uppercase tracking-[0.2em] font-bold">
                Core Features
              </h2>
              <div className="w-16 h-0.5 bg-fantasy-gold mx-auto mt-4 opacity-50"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Feature 1: Drag & Drop */}
              <div className="bg-[#1a1714] border border-[#3a3022] rounded p-8 hover:border-fantasy-gold transition-all duration-300 flex flex-col sm:flex-row gap-5">
                <div className="p-4 bg-[#110f0d] rounded h-fit medieval-border text-fantasy-gold flex items-center justify-center shrink-0">
                  <Palette className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-serif text-lg text-fantasy-gold uppercase tracking-wider font-semibold flex items-center gap-2">
                    <span>🎨</span> Drag-and-Drop Map Creator
                  </h3>
                  <p className="text-stone-400 text-xs md:text-sm leading-relaxed font-sans">
                    Bring your board game to life using our massive library of predefined templates, vibrant backgrounds, and whimsical icons. Just select, drag, and position your elements anywhere on the canvas.
                  </p>
                </div>
              </div>

              {/* Feature 2: Custom Image Uploads */}
              <div className="bg-[#1a1714] border border-[#3a3022] rounded p-8 hover:border-fantasy-gold transition-all duration-300 flex flex-col sm:flex-row gap-5">
                <div className="p-4 bg-[#110f0d] rounded h-fit medieval-border text-fantasy-gold flex items-center justify-center shrink-0">
                  <Image className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-serif text-lg text-fantasy-gold uppercase tracking-wider font-semibold flex items-center gap-2">
                    <span>🖼️</span> Custom Image Uploads
                  </h3>
                  <p className="text-stone-400 text-xs md:text-sm leading-relaxed font-sans">
                    Want to be the hero of your own game? Upload your own drawings, family photos, or custom graphics to build a completely unique board game world.
                  </p>
                </div>
              </div>

              {/* Feature 3: All-in-One Digital Game Zone */}
              <div className="bg-[#1a1714] border border-[#3a3022] rounded p-8 hover:border-fantasy-gold transition-all duration-300 flex flex-col sm:flex-row gap-5">
                <div className="p-4 bg-[#110f0d] rounded h-fit medieval-border text-fantasy-gold flex items-center justify-center shrink-0">
                  <Dices className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-serif text-lg text-fantasy-gold uppercase tracking-wider font-semibold flex items-center gap-2">
                    <span>🎲</span> All-in-One Digital Game Zone
                  </h3>
                  <p className="text-stone-400 text-xs md:text-sm leading-relaxed font-sans">
                    Ready to play? Switch instantly to our Game Area to play fully interactive digital versions of beloved classics like Ludo, Snakes and Ladders, and Tic-Tac-Toe.
                  </p>
                </div>
              </div>

              {/* Feature 4: Playful Learning */}
              <div className="bg-[#1a1714] border border-[#3a3022] rounded p-8 hover:border-fantasy-gold transition-all duration-300 flex flex-col sm:flex-row gap-5">
                <div className="p-4 bg-[#110f0d] rounded h-fit medieval-border text-fantasy-gold flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-serif text-lg text-fantasy-gold uppercase tracking-wider font-semibold flex items-center gap-2">
                    <span>🧠</span> Playful Learning & Early Education
                  </h3>
                  <p className="text-stone-400 text-xs md:text-sm leading-relaxed font-sans">
                    Designed with young learners in mind! Built-in educational templates help kids learn numbers, practice the alphabet, and build vocabulary while designing their maps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Parents & Educators Love FantacyMapMaker */}
        <section className="py-24 px-6 relative z-10 border-b border-[#3a3022] bg-[#12100e]">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="font-serif text-2xl md:text-3xl text-fantasy-gold uppercase tracking-[0.2em] font-bold">
              Why Parents & Educators Love FantacyMapMaker
            </h2>
            <div className="w-16 h-0.5 bg-fantasy-gold mx-auto my-4 opacity-50"></div>
            <p className="text-stone-300 font-sans text-base leading-relaxed max-w-3xl mx-auto">
              FantacyMapMaker bridges the gap between screen time and cognitive development. By designing their own rules, paths, and visual layouts, children develop spatial awareness, logical thinking, and storytelling skills in an environment that feels like pure fun.
            </p>
          </div>
        </section>

        {/* Footer / About Summary - Solid Rich Backdrop */}
        <footer className="border-t border-[#3a3022] bg-[#0c0a09] py-32 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-16">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="https://i.postimg.cc/rpyZ4WwW/Fantacy.png" 
                  alt="FantacyMapMaker Logo" 
                  className="h-10 w-auto select-none rounded-md border border-[#3a3022]/40"
                  referrerPolicy="no-referrer"
                />
                <h2 className="font-serif text-2xl text-fantasy-gold uppercase tracking-[0.2em] drop-shadow">FantacyMapMaker</h2>
              </div>
              <p className="text-zinc-400 font-serif leading-relaxed text-sm italic font-bold">
                "Every great game begins on the canvas of a visionary." Create, design, and play custom board games with your own imagination.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <FooterLinkGroup title="Pages" links={['Chronicles', 'About US']} onLinkClick={handleLinkClick} />
              <FooterLinkGroup title="Privacy & Terms" links={['Privacy and Policy']} onLinkClick={handleLinkClick} />
              <FooterLinkGroup title="Contact" links={['Support']} onLinkClick={handleLinkClick} />
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto mt-32 pt-8 border-t border-[#3a3022] flex justify-between items-center text-[9px] text-[#4d4030] uppercase tracking-[0.4em] font-bold">
            <span>© FantacyMapMaker Team</span>
            <span>All Rights Reserved</span>
          </div>
        </footer>
      </div>

      {/* MODAL INFORMATION OVERLAY */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/85 transition-all">
          <div className="w-full max-w-3xl bg-[#f4efe2] text-[#2a2015] border-8 border-double border-[#8b5e3c] rounded p-6 md:p-10 max-h-[85vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] relative font-serif class-scroll custom-scrollbar">
            
            {/* Elegant Close Button top right */}
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full border border-[#8b5e3c]/40 hover:bg-[#ebdcb9] text-[#5c4033] transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* --- PRIVACY CONTENT --- */}
            {activeModal === 'privacy' && (
              <div className="space-y-6">
                <div className="border-b-2 border-dashed border-[#8b5e3c]/20 pb-4 text-center">
                  <div className="mx-auto w-12 h-12 rounded bg-[#ebdcb9] flex items-center justify-center mb-3 border border-[#8b5e3c]/40">
                    <Shield className="w-6 h-6 text-[#8b5e3c]" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-serif font-black uppercase tracking-[0.2em] text-[#5c4033]">
                    Privacy Policy
                  </h1>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b5e3c]/80 mt-1">
                    Effective & Last Updated: May 22, 2026
                  </p>
                </div>

                <div className="bg-[#ebdcb9]/40 border border-[#8b5e3c]/20 p-4 rounded text-xs italic text-[#5c4033] leading-relaxed">
                  Welcome to <strong>FantacyMapMaker</strong>! We are committed to safeguarding the safety and privacy of our young designers and providing absolute peace of mind to parents, guardians, and educators. 
                  As a platform designed with children in mind, we take safety and transparency seriously. We adhere strictly to the principles of the <strong>Children's Online Privacy Protection Act (COPPA)</strong>.
                </div>

                <div className="space-y-4">
                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    1. Information We Collect
                  </h2>
                  <p className="text-xs leading-relaxed text-[#3d2e1f]">
                    We believe in minimizing data collection to keep our digital space completely safe and worry-free:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#3d2e1f]">
                    <li>
                      <strong>No Mandatory Account Registration:</strong> Children can freely create and play without needing to provide personal details like names, phone numbers, or email addresses.
                    </li>
                    <li>
                      <strong>Uploaded Images & Assets:</strong> Users can upload custom images from their device to serve as card backgrounds or token icons.
                      <p className="mt-1 italic font-semibold text-[#5c4033]">
                        🛡️ Privacy Protection: These images are processed entirely locally. They are stored inside your browser's private storage, are used solely for your active game board rendering, and are NEVER sent to our servers or shared with any third parties.
                      </p>
                    </li>
                    <li>
                      <strong>Local Application State:</strong> To save active board configuration details, we use client-side storage (<code>localStorage</code>). This data remains exclusively on your physical device.
                    </li>
                  </ul>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    2. How We Use Information
                  </h2>
                  <p className="text-xs leading-relaxed text-[#3d2e1f]">
                    Any minimal local information processed on your browser serves only to:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#3d2e1f]">
                    <li>Render your custom board design templates and icons safely.</li>
                    <li>Ensure you do not lose progress on your boards when you close the tab.</li>
                    <li>Provide full interactivity in our digital Game Area (Ludo, Snakes and Ladders, Tic-Tac-Toe).</li>
                  </ul>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    3. Data Security & Standard Third Parties
                  </h2>
                  <p className="text-xs leading-relaxed text-[#3d2e1f]">
                    We maintain an absolute zero-sharing pledge:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#3d2e1f]">
                    <li><strong>No Advertisements:</strong> We do not display dynamic third-party tracking advertisements.</li>
                    <li><strong>No External Databases:</strong> We do not maintain a centralized user database, ensuring no data reaches any external server.</li>
                  </ul>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    4. Parents' Rights & Controls
                  </h2>
                  <p className="text-xs leading-relaxed text-[#3d2e1f]">
                    You hold full authority over your child's digital sandbox. You have the absolute right to view, modify, or delete any local save data. Since everything runs locally, clicking "Clear Browser Data" in your settings will permanently wipe all local board files. For questions, reach out directly at: <a href="mailto:protoolforyou@gmail.com" className="text-[#8b5e3c] font-bold hover:underline">protoolforyou@gmail.com</a>.
                  </p>
                </div>
              </div>
            )}

            {/* --- ABOUT US CONTENT --- */}
            {activeModal === 'about' && (
              <div className="space-y-6">
                <div className="border-b-2 border-dashed border-[#8b5e3c]/20 pb-4 text-center">
                  <div className="mx-auto w-12 h-12 rounded bg-[#ebdcb9] flex items-center justify-center mb-3 border border-[#8b5e3c]/40">
                    <Sword className="w-6 h-6 text-[#8b5e3c]" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-serif font-black uppercase tracking-[0.2em] text-[#5c4033]">
                    About FantacyMapMaker
                  </h1>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b5e3c]/80 mt-1">
                    Blending MNC Enterprise Expertise with Childhood Imagination
                  </p>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-[#3d2e1f]">
                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1">
                    Our Origin Story
                  </h2>
                  <p>
                    <strong>FantacyMapMaker</strong> was built from the ground up by a seasoned <strong>IT Professional with over 15 years of industry experience</strong> in prestigious, world-recognized Multinational Corporations (MNCs). Having spent over a decade constructing high-speed cloud infrastructure and complex enterprise software systems, our builder embarked on a much more inspiring mission: to construct a safe, high-quality, and deeply interactive digital space where children, educators, and parents can work together to bring their own board games to life.
                  </p>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    Our Core Mission
                  </h2>
                  <p>
                    We believe in empowering children to use design thinking and active imagination through tangible creation. With FantacyMapMaker:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-sans text-[11px] text-[#3d2e1f]">
                    <li>
                      <strong>The Design Canvas (Canvas Area):</strong> Kids use simple, satisfying drag-and-drop mechanics to map custom grids, path tiles, beautiful backdrops, and board tokens.
                    </li>
                    <li>
                      <strong>The Classic Games (Game Area):</strong> They can instantly put their designs to the test and enjoy timeless multiplayer gems such as <strong>Ludo</strong>, <strong>Snakes & Ladders</strong>, or guided <strong>Tic-Tac-Toe</strong>.
                    </li>
                  </ul>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    Contact Us
                  </h2>
                  <p>
                    We value simplicity, education, and safe, creative environments. If you are an educator hoping to bring tactile map-making to the classroom, a parent with custom ideas, or simply looking to share feedback with the developer, send your message directly to: <a href="mailto:protoolforyou@gmail.com" className="text-[#8b5e3c] font-bold hover:underline">protoolforyou@gmail.com</a>.
                  </p>
                </div>
              </div>
            )}

            {/* --- SUPPORT CONTENT --- */}
            {activeModal === 'support' && (
              <div className="space-y-6">
                <div className="border-b-2 border-dashed border-[#8b5e3c]/20 pb-4 text-center">
                  <div className="mx-auto w-12 h-12 rounded bg-[#ebdcb9] flex items-center justify-center mb-3 border border-[#8b5e3c]/40">
                    <Mail className="w-6 h-6 text-[#8b5e3c]" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-serif font-black uppercase tracking-[0.2em] text-[#5c4033]">
                    Help & Support
                  </h1>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b5e3c]/80 mt-1">
                    Help Desk & Troubleshooting Guide
                  </p>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-[#3d2e1f]">
                  <p>
                    Having trouble with your layout or looking to submit a suggestion? Review troubleshooting tips below:
                  </p>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-4">
                    Common Support Solutions
                  </h2>
                  
                  <div className="space-y-3 mt-2">
                    <div className="bg-[#ebdcb9]/20 p-3 rounded border border-[#8b5e3c]/15">
                      <strong className="text-xs text-[#5c4033] block mb-1">1. Image Upload Failures?</strong>
                      <span className="text-xs text-[#3d2e1f]">
                        Ensure files are formatted as standard images (<code>.png</code>, <code>.jpg</code>, <code>.jpeg</code>, or <code>.webp</code>). Size limit is 5MB per upload. Keep dimensions reasonable as rendering relies fully on your machine's browser memory.
                      </span>
                    </div>

                    <div className="bg-[#ebdcb9]/20 p-3 rounded border border-[#8b5e3c]/15">
                      <strong className="text-xs text-[#5c4033] block mb-1">2. Drag-and-Drop Glitching?</strong>
                      <span className="text-xs text-[#3d2e1f]">
                        Don't worry! You can double-click or double-tap on any tile, badge, or characters inside the <strong>Asset Library</strong> panel. This will automatically spawn and place it directly onto the Canvas Board!
                      </span>
                    </div>

                    <div className="bg-[#ebdcb9]/20 p-3 rounded border border-[#8b5e3c]/15">
                      <strong className="text-xs text-[#5c4033] block mb-1">3. Cannot Export Map?</strong>
                      <span className="text-xs text-[#3d2e1f]">
                        To prevent file export failures, ensure you click the <strong>Save Board</strong> option in the top ribbon menu first! The engine validates unsaved board files to clear outstanding coordinates before compiling print-ready files.
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    Contact Developer
                  </h2>
                  <p>
                    For any support queries, help clearing files, classroom collaborations, or quick feedback, reach out immediately via:
                  </p>
                  <div className="border border-[#8b5e3c]/30 rounded p-4 bg-[#ebdcb9]/40 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#8b5e3c]" />
                    <span className="text-xs font-bold text-[#5c4033] tracking-wide">
                      protoolforyou@gmail.com
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Seals Scroll Footer button */}
            <div className="mt-8 pt-4 border-t border-[#8b5e3c]/20 flex justify-center">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 bg-[#8b5e3c] text-white hover:bg-[#5c4033] font-serif text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded shadow-md border border-[#8b5e3c]"
              >
                Close and Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Scroll Up Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[999] p-3.5 bg-fantasy-gold hover:bg-amber-400 text-stone-950 font-bold border border-[#3a3022] hover:border-fantasy-gold rounded shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-all cursor-pointer flex items-center justify-center opacity-95 hover:opacity-100 backdrop-blur-sm focus:outline-none"
            title="Scroll to Top"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5 shrink-0" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div 
    className="p-10 rounded bg-[#1a1714] border border-[#3a3022] hover:border-fantasy-gold transition-all duration-200 group"
  >
    <div className="mb-8 p-5 rounded bg-[#110f0d] w-fit group-hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all medieval-border">
      {icon}
    </div>
    <h3 className="font-serif text-lg text-fantasy-gold mb-4 uppercase tracking-[0.2em]">{title}</h3>
    <p className="text-stone-400 text-xs leading-loose font-serif italic">{description}</p>
  </div>
);

const FooterLinkGroup = ({ title, links, onLinkClick }: { title: string, links: string[], onLinkClick?: (link: string) => void }) => (
  <div className="space-y-6">
    <h4 className="font-serif text-[10px] uppercase tracking-[0.3em] text-stone-500 border-b border-[#3a3022] pb-3 font-bold">{title}</h4>
    <ul className="space-y-3">
      {links.map(link => (
        <li key={link}>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onLinkClick) onLinkClick(link);
            }}
            className="text-stone-600 hover:text-fantasy-gold transition-colors text-[10px] font-bold uppercase tracking-widest text-left cursor-pointer"
          >
            {link}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
