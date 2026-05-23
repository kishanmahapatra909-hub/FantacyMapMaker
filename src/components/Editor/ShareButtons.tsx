import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Share2, Check, Loader2 } from 'lucide-react';

export const ShareButtons: React.FC = () => {
  const { config, stage, ludoActive, snakesActive, tictactoeActive } = useEditorStore();
  const [isCapturing, setIsCapturing] = useState(false);
  const [copied, setCopied] = useState(false);

  const getCanvasBlob = async (): Promise<Blob | null> => {
    try {
      if (ludoActive) {
        const boardElement = document.getElementById('ludo-board-container');
        if (boardElement) {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(boardElement, {
            useCORS: true,
            backgroundColor: '#000000',
            scale: 1.5
          });
          return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        }
      }

      if (snakesActive) {
        const boardElement = document.getElementById('snakes-board-container');
        if (boardElement) {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(boardElement, {
            useCORS: true,
            backgroundColor: '#0a0807',
            scale: 1.5
          });
          return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        }
      }

      if (tictactoeActive) {
        const boardElement = document.getElementById('tictactoe-board-container');
        if (boardElement) {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(boardElement, {
            useCORS: true,
            backgroundColor: '#0a0807',
            scale: 1.5
          });
          return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        }
      }

      if (stage) {
        const dataURL = stage.toDataURL({
          pixelRatio: 1.5,
          mimeType: 'image/png'
        });
        const response = await fetch(dataURL);
        return await response.blob();
      }
    } catch (e) {
      console.error('Error rendering image for sharing:', e);
    }
    return null;
  };

  const handleShare = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'linkedin' | 'copylink' | 'native') => {
    setIsCapturing(true);

    const siteUrl = window.location.origin + window.location.pathname;
    const defaultImage = 'https://i.postimg.cc/rpyZ4WwW/Fantacy.png'; // High resolution brand image
    const title = `My Custom Board Game: ${config.name}`;
    const descText = `Check out my custom board game "${config.name}" designed on FantacyMapMaker! Create yours now:`;

    if (platform === 'native') {
      try {
        const blob = await getCanvasBlob();
        if (blob && navigator.share && navigator.canShare) {
          const file = new File([blob], `${config.name.toLowerCase().replace(/\s+/g, '-')}-board.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: title,
              text: descText + ' ' + siteUrl,
            });
            setIsCapturing(false);
            return;
          }
        }
      } catch (e) {
        console.error('Web Share API error:', e);
      }
    }

    if (platform === 'copylink') {
      try {
        await navigator.clipboard.writeText(`${descText} ${siteUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text', err);
      }
      setIsCapturing(false);
      return;
    }

    // Capture or fallback
    let imageUrl = defaultImage;
    // Note: Social platform sharers (Facebook, Pinterest, LinkedIn, Twitter/X) cannot scraping private local blob URLs.
    // They must scrap a publicly available URL. Hence we use the logo & dynamic query parameters.

    let shareUrlWithParams = `${siteUrl}?board=${encodeURIComponent(config.name)}`;
    const text = `${descText} ${shareUrlWithParams} - Crafted at ${siteUrl}`;

    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrlWithParams)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrlWithParams)}&text=${encodeURIComponent(descText)}&hashtags=FantacyMapMaker,BoardGames`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(descText + ' ' + shareUrlWithParams)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrlWithParams)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=450,resizable=yes');
    }

    setIsCapturing(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Copied indicator */}
      {copied && (
        <span className="text-[8px] text-green-400 font-bold uppercase tracking-wider animate-fade-in mr-1">
          Copied Scroll Link!
        </span>
      )}

      {isCapturing ? (
        <div className="flex items-center gap-1.5 px-2 py-1 text-[8px] bg-black/50 rounded-md text-fantasy-gold/60 border border-fantasy-gold/20">
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
          <span>Scribing Blueprint...</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {/* FB */}
          <button
            onClick={() => handleShare('facebook')}
            className="p-1 rounded bg-[#3b5998]/10 hover:bg-[#3b5998]/30 border border-[#3b5998]/40 hover:border-[#3b5998] text-[#3b5998] hover:text-[#4e71ba] transition-all cursor-pointer flex items-center justify-center w-5.5 h-5.5"
            title="Share on Facebook"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V2h-3a5 5 0 0 0-5 5v1z" />
            </svg>
          </button>

          {/* X (Twitter) */}
          <button
            onClick={() => handleShare('twitter')}
            className="p-1 rounded bg-stone-900 hover:bg-black/90 border border-stone-800 hover:border-stone-500 text-[#e0d8c3] hover:text-white transition-all cursor-pointer flex items-center justify-center w-5.5 h-5.5"
            title="Share on X"
          >
            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => handleShare('whatsapp')}
            className="p-1 rounded bg-[#25d366]/10 hover:bg-[#25d366]/30 border border-[#25d366]/40 hover:border-[#25d366] text-[#25d366] hover:text-[#39df78] transition-all cursor-pointer flex items-center justify-center w-5.5 h-5.5"
            title="Share on WhatsApp"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.11 1.5 5.166 1.5 5.301 0 9.613-4.313 9.615-9.617.002-2.57-1.002-4.985-2.83-6.81-1.826-1.827-4.25-2.834-6.785-2.835-5.304 0-9.615 4.313-9.618 9.618-.001 2.005.522 3.58 1.522 5.164L2.532 21.43l5.09-1.334-.975-.942z" />
            </svg>
          </button>

          {/* LinkedIn */}
          <button
            onClick={() => handleShare('linkedin')}
            className="p-1 rounded bg-[#0077b5]/10 hover:bg-[#0077b5]/30 border border-[#0077b5]/40 hover:border-[#0077b5] text-[#0077b5] hover:text-[#1a8bc8] transition-all cursor-pointer flex items-center justify-center w-5.5 h-5.5"
            title="Share on LinkedIn"
          >
            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </button>

          {/* Copy Link button */}
          <button
            onClick={() => handleShare('copylink')}
            className="p-1 rounded-sm hover:bg-white/5 border border-stone-800 hover:border-fantasy-gold text-stone-500 hover:text-fantasy-gold transition-all cursor-pointer flex items-center justify-center w-5.5 h-5.5"
            title="Copy Share Link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Native Web Share API if supported */}
          {typeof navigator !== 'undefined' && navigator.share && navigator.canShare && (
            <button
              onClick={() => handleShare('native')}
              className="px-2 py-1 rounded bg-fantasy-gold/10 hover:bg-fantasy-gold/25 text-fantasy-gold border border-fantasy-gold/30 rounded text-[8px] font-bold uppercase tracking-widest transition-all h-5.5 flex items-center justify-center"
              title="Native Share"
            >
              Share Image
            </button>
          )}
        </div>
      )}
    </div>
  );
};
