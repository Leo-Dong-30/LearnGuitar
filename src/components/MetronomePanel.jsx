import React from 'react';
import { Radio, Square, Play } from 'lucide-react';

/**
 * MetronomePanel 组件 - 节奏控制器
 * * 功能：
 * 1. 控制 metronomeEngine 的启停
 * 2. 实时调节 BPM (每分钟节拍数)
 * 3. 视觉反馈：LED 灯随节拍闪烁
 */

const MetronomePanel = ({ bpm, isMetronomePlaying, toggleMetronome, updateBpm }) => {
  return (
    <div className="bg-gray-900/40 p-5 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-2 text-amber-500 mb-3">
        <Radio size={14} className={isMetronomePlaying ? 'animate-pulse' : ''} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Metronome</span>
      </div>
      <div className="flex items-center gap-5">
        <button 
          onClick={toggleMetronome} 
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${isMetronomePlaying ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
        >
          {isMetronomePlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-black text-white italic leading-none">{bpm}</span>
            <span className="text-[10px] text-gray-600 font-bold uppercase">BPM</span>
          </div>
          <input 
            type="range" 
            min="40" 
            max="220" 
            value={bpm} 
            onChange={(e) => updateBpm(e.target.value)} 
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>
      </div>
    </div>
  );
};

export default MetronomePanel;