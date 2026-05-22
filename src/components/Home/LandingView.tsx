import React, { useState } from 'react';
import { Hero } from './Hero';
import { motion } from 'motion/react';
import { Sword, Shield, Map as MapIcon, Layers, Download, Sparkles, X, Mail } from 'lucide-react';

interface LandingViewProps {
  onStart: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'about' | 'support' | null>(null);

  const handleLinkClick = (link: string) => {
    if (link === 'Privacy Scrolls') {
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
          src="https://i.postimg.cc/d3C8pdDM/Main-Page.png" 
          alt="Main Page Background" 
          className="w-full h-full object-cover object-center select-none"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-10">
        <Hero onStart={onStart} />
        
        {/* Features Section - Solid Rich Medieval Backdrop */}
        <section className="py-32 px-6 relative z-10 border-y border-[#3a3022] bg-[#12100e]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layers className="w-8 h-8 text-fantasy-gold" />}
              title="Grimoire of Assets"
              description="Stack textures, paths, and magical relics with a sophisticated layering system."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-fantasy-gold" />}
              title="Medieval Cartography"
              description="Choose from hand-crafted fantasy templates designed for high-stakes adventure."
            />
            <FeatureCard 
              icon={<Download className="w-8 h-8 text-fantasy-gold" />}
              title="Noble Relics"
              description="Download your artifacts in lossless PNG or print-ready PDF formats."
            />
          </div>
        </section>

        {/* Footer / About Summary - Solid Rich Backdrop */}
        <footer className="border-t border-[#3a3022] bg-[#0c0a09] py-32 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-16">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-fantasy-gold rounded-sm flex items-center justify-center transform rotate-45 medieval-border">
                    <div className="transform -rotate-45 text-[#1a1814] font-bold text-xl font-serif">F</div>
                 </div>
                 <h2 className="font-serif text-2xl text-fantasy-gold uppercase tracking-[0.2em] drop-shadow">Guild of Makers</h2>
              </div>
              <p className="text-zinc-400 font-serif leading-relaxed text-sm italic font-bold">
                "Every great adventure begins on the parchment of a visionary." Craftsmen of digital worlds, we provide the tools, you provide the legend.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <FooterLinkGroup title="The Sanctuary" links={['Chronicles', 'About US', 'Testimonials']} onLinkClick={handleLinkClick} />
              <FooterLinkGroup title="Ancient Laws" links={['Privacy Scrolls', 'Ethics', 'User Rights']} onLinkClick={handleLinkClick} />
              <FooterLinkGroup title="Messenger" links={['Messenger', 'Support', 'Discord Forge']} onLinkClick={handleLinkClick} />
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto mt-32 pt-8 border-t border-[#3a3022] flex justify-between items-center text-[9px] text-[#4d4030] uppercase tracking-[0.4em] font-bold">
            <span>MDCCXXVI © Fantasy Game Board Guild</span>
            <span>Etched in the Digital Void</span>
          </div>
        </footer>
      </div>

      {/* MODAL PARCHMENT SCROLL OVERLAY */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/85 transition-all">
          <div className="w-full max-w-3xl bg-[#f4efe2] text-[#2a2015] border-8 border-double border-[#8b5e3c] rounded p-6 md:p-10 max-h-[85vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] relative font-serif class-scroll custom-scrollbar">
            
            {/* Elegant Close Button top right */}
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full border border-[#8b5e3c]/40 hover:bg-[#ebdcb9] text-[#5c4033] transition-colors cursor-pointer"
              title="Close Scroll"
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
                    Privacy Scrolls
                  </h1>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b5e3c]/80 mt-1">
                    Effective & Last Updated: May 22, 2026
                  </p>
                </div>

                <div className="bg-[#ebdcb9]/40 border border-[#8b5e3c]/20 p-4 rounded text-xs italic text-[#5c4033] leading-relaxed">
                  Welcome to <strong>FantacyMapMaker</strong>! We are committed to safeguarding the digital sanctuary of our young cartographers and providing absolute peace of mind to parents, guardians, and educators. 
                  As a platform designed with children in mind, we take safety and transparency seriously. We adhere strictly to the principles of the <strong>Children's Online Privacy Protection Act (COPPA)</strong>.
                </div>

                <div className="space-y-4">
                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    1. Information We Collect
                  </h2>
                  <p className="text-xs leading-relaxed text-[#3d2e1f]">
                    We believe in minimizing data collection to keep our digital realms completely safe and worry-free:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#3d2e1f]">
                    <li>
                      <strong>No Mandatory Account Registration:</strong> Children can freely craft and play without needing to provide personal details like names, phone numbers, or email addresses.
                    </li>
                    <li>
                      <strong>Uploaded Images & Assets:</strong> Users can upload custom images from their device to serve as card backgrounds or token icons.
                      <p className="mt-1 italic font-semibold text-[#5c4033]">
                        🛡️ Crucial Protection: These images are processed entirely locally. They are stored inside your browser's private state, are used solely for your active game board rendering, and are NEVER sent to our servers or shared with any third parties.
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
                    <li>Render your custom board design templates, relics, and tokens safely.</li>
                    <li>Ensure you do not lose progress on your boards when you close the tab.</li>
                    <li>Provide full interactivity in our digital Game Area (Ludo, Snakes and Ladders, Tic-Tac-Toe).</li>
                  </ul>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    3. Ultimate Data Security & Standard Third Parties
                  </h2>
                  <p className="text-xs leading-relaxed text-[#3d2e1f]">
                    We maintain an absolute zero-sharing pledge:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#3d2e1f]">
                    <li><strong>No Advertisements:</strong> We do not display dynamic third-party tracking advertisements.</li>
                    <li><strong>No External Databases:</strong> We don't maintain a centralized user database, ensuring no corporate breaches could compromise files.</li>
                  </ul>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    4. Parents' Rights & Controls
                  </h2>
                  <p className="text-xs leading-relaxed text-[#3d2e1f]">
                    You hold supreme authority over your child's digital sandbox. You have the absolute right to view, modify, or delete any local save data. Since everything runs locally, clicking "Clear Browser Data" in your settings will permanently wipe all local board files. For questions, reach out directly at: <a href="mailto:protoolforyou@gmail.com" className="text-[#8b5e3c] font-bold hover:underline">protoolforyou@gmail.com</a>.
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
                    The Guild of FantacyMapMaker
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
                    <strong>FantacyMapMaker</strong> was built from the ground up by a seasoned <strong>IT Professional with over 15 years of industry experience</strong> in prestigious, world-recognized Multinational Corporations (MNCs). Having spent over a decade constructing high-speed cloud infrastructure and complex enterprise software systems, our builder embarked on a much more inspiring mission: to construct a safe, high-quality, and deeply interactive digital sandbox where children, educators, and parents can work together to bring their own boards to life.
                  </p>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    Our Core Mission
                  </h2>
                  <p>
                    We believe in empowering children to use design thinking and active imagination through tangible creation. With FantacyMapMaker:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-sans text-[11px] text-[#3d2e1f]">
                    <li>
                      <strong>The Creative Forge (Canvas Area):</strong> Kids use simple, satisfying drag-and-drop mechanics to map custom grids, path tiles, beautiful parchment backdrops, and fantasy relics.
                    </li>
                    <li>
                      <strong>The Classic Sanctuary (Game Area):</strong> They can instantly put their rules to the test and enjoy timeless multiplayer gems such as <strong>Ludo</strong>, <strong>Snakes & Ladders</strong>, or terminal-guided <strong>Tic-Tac-Toe</strong>.
                    </li>
                  </ul>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-6">
                    Join Our Guild
                  </h2>
                  <p>
                    We value simplicity, education, and safe, tranquil environments. If you are an educator hoping to bring tactile map-making to the classroom, a parent with custom ideas, or simply looking to share feedback with the chef d'oeuvre engineer, send your message directly to: <a href="mailto:protoolforyou@gmail.com" className="text-[#8b5e3c] font-bold hover:underline">protoolforyou@gmail.com</a>.
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
                    Messenger & Support
                  </h1>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#8b5e3c]/80 mt-1">
                    Help Desk & Troubleshooting Guide
                  </p>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-[#3d2e1f]">
                  <p>
                    Having trouble with your layout or looking to submit a custom relic suggestion? Review standard instructions below:
                  </p>

                  <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#5c4033] border-b border-[#8b5e3c]/30 pb-1 mt-4">
                    Common Cartographer Solutions
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
                        Don't stress! You can double-click or double-tap on any tile, waypoint, or character inside the <strong>Asset Grimoire</strong> panel. This will automatically spawn and duplicate it directly onto the Canvas Board!
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
                    Contact Chief Engineers
                  </h2>
                  <p>
                    For any support queries, full account or clear cookies guides, classroom collaborations, or quick feedback, reach out immediately via:
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
                Seal Scroll & Return to Castle
              </button>
            </div>
          </div>
        </div>
      )}
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
