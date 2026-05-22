import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { ScrollText, Users, Trophy, Sword, Zap, Heart, ShieldAlert, Sparkles } from 'lucide-react';
import { ParchmentWrapper } from '../Theme/ParchmentWrapper';

export const RulesPanel: React.FC = () => {
  const { config, updateRules } = useEditorStore();
  const { rules } = config;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 text-fantasy-gold mb-6">
        <ScrollText className="w-5 h-5" />
        <h2 className="font-serif uppercase tracking-widest text-sm">Codex of Rules</h2>
      </div>

      <div className="space-y-4">
        <RuleField
          icon={<Sword className="w-3 h-3" />}
          label="Game Title"
          value={rules.title}
          onChange={(v) => updateRules({ title: v })}
          placeholder="Path of the Dragon..."
        />
        <RuleField
          icon={<Users className="w-3 h-3" />}
          label="Number of Players"
          value={rules.players}
          onChange={(v) => updateRules({ players: v })}
          placeholder="2-4 Players"
        />
        <RuleField
          icon={<Trophy className="w-3 h-3" />}
          label="Win Conditions"
          value={rules.winConditions}
          onChange={(v) => updateRules({ winConditions: v })}
          placeholder="Collect 5 ancient runes..."
          multiline
        />
        <RuleField
          icon={<Zap className="w-3 h-3" />}
          label="Movement Rules"
          value={rules.movementRules}
          onChange={(v) => updateRules({ movementRules: v })}
          placeholder="Roll 1D6..."
          multiline
        />
        <RuleField
          icon={<Sparkles className="w-3 h-3" />}
          label="Special Powers"
          value={rules.specialPowers}
          onChange={(v) => updateRules({ specialPowers: v })}
          placeholder="Archmage can teleport..."
          multiline
        />
        <RuleField
          icon={<ShieldAlert className="w-3 h-3" />}
          label="Hazards & Penalties"
          value={rules.penalties}
          onChange={(v) => updateRules({ penalties: v })}
          placeholder="Falling in lava skips 1 turn..."
          multiline
        />
        <RuleField
          icon={<Heart className="w-3 h-3" />}
          label="Checkpoints"
          value={rules.checkpointRules}
          onChange={(v) => updateRules({ checkpointRules: v })}
          placeholder="Respawn at last altar..."
          multiline
        />
      </div>

      <div className="pt-6">
        <ParchmentWrapper className="text-[10px] leading-relaxed italic opacity-80" variant="dark">
          "The rules defined here will be bundled with your board export as a secondary document."
        </ParchmentWrapper>
      </div>
    </div>
  );
};

const RuleField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  icon, 
  multiline 
}: { 
  label: string, 
  value: string, 
  onChange: (v: string) => void, 
  placeholder: string,
  icon: React.ReactNode,
  multiline?: boolean
}) => (
    <div className="space-y-3 group">
    <label className="text-[10px] uppercase text-stone-500 font-bold tracking-widest flex items-center gap-2 group-hover:text-fantasy-gold transition-colors">
      {icon} {label}
    </label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-[#3a3022] rounded p-3 text-[11px] text-[#e0d8c3] placeholder:text-stone-800 focus:ring-1 focus:ring-fantasy-gold/30 focus:border-fantasy-gold outline-none transition-all min-h-[100px]"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-[#3a3022] rounded p-3 text-[11px] text-[#e0d8c3] placeholder:text-stone-800 focus:ring-1 focus:ring-fantasy-gold/30 focus:border-fantasy-gold outline-none transition-all"
      />
    )}
  </div>
);
