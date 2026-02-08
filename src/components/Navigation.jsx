/**
 * Navigation 组件 - 顶部全局导航栏
 * * 职责：
 * 1. 切换应用运行模式 (探索、键盘、识别、练习)
 * 2. 显示麦克风实时状态 (Live/Standby)
 * 3. 封装模式切换时的状态清理逻辑
 */

import React from 'react';
import { 
  Music, Mic, Keyboard as KeyboardIcon, Layout, 
  Gamepad2, BookOpen, Volume2, Move, ChevronDown, 
  Settings, Target 
} from 'lucide-react';

// 内部子组件 1：导航按钮
const NavBtn = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`px-5 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 ${
      active 
        ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
        : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    {icon} {label}
  </button>
);

// 内部子组件 2：练习菜单项
const ExerciseItem = ({ onClick, icon, title, desc, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left ${
      disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-amber-600/10 group/item'
    }`}
  >
    <div className={`transition-colors ${disabled ? 'text-gray-600' : 'text-amber-500 group-hover/item:text-amber-400'}`}>
      {icon}
    </div>
    <div>
      <div className={`text-[11px] font-black uppercase tracking-tight ${disabled ? 'text-gray-600' : 'text-white'}`}>
        {title}
      </div>
      <div className="text-[9px] text-gray-500 font-bold">{desc}</div>
    </div>
  </button>
);

const Navigation = ({ 
  mode, 
  setMode, 
  isListening, 
  stopDetection, 
  startDetection, 
  setPressedKeys, 
  setExerciseType, 
  setShowHints,
  startEarTraining
}) => {
  
  // 统一的模式切换处理器
  const handleModeChange = (newMode) => {
    stopDetection();
    setMode(newMode);
    setPressedKeys(new Set());
    setExerciseType(null);
    setShowHints(false);
  };

  return (
    <nav className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md fixed top-0 w-full z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <Music size={18} className="text-white" />
        </div>
        <h1 className="text-lg font-bold tracking-tighter text-white uppercase">GUITAR LAB</h1>
      </div>

      {/* 模式切换器 */}
      <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800 shadow-inner">
        <NavBtn 
          active={mode === 'explore'} 
          onClick={() => handleModeChange('explore')} 
          icon={<Layout size={14} />} 
          label="探索" 
        />
        <NavBtn 
          active={mode === 'keyboard'} 
          onClick={() => handleModeChange('keyboard')} 
          icon={<KeyboardIcon size={14} />} 
          label="键盘" 
        />
        <NavBtn 
          active={mode === 'mic'} 
          onClick={() => { setMode('mic'); startDetection(); setPressedKeys(new Set()); setExerciseType(null); setShowHints(false); }} 
          icon={<Mic size={14} />} 
          label="识别" 
        />
        
        {/* 练习模式下拉菜单 */}
        <div className="relative group">
          <button className={`px-5 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            mode === 'practice' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
          }`}>
            <Target size={14} /> 练习模式 <ChevronDown size={12} className="group-hover:rotate-180 transition-transform" />
          </button>
          
          <div className="absolute top-full right-0 mt-1 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-[100] backdrop-blur-xl">
            <ExerciseItem 
              onClick={() => startEarTraining(setMode)} 
              icon={<Volume2 size={14}/>} 
              title="盲听练习" 
              desc="听音辩位训练" 
            />
            <ExerciseItem icon={<Gamepad2 size={14}/>} title="动态爬格子" desc="节奏精准度训练" disabled />
            <ExerciseItem icon={<Move size={14}/>} title="和弦跑道" desc="肌肉记忆强化" disabled />
            <ExerciseItem icon={<BookOpen size={14}/>} title="即兴挑战" desc="限定音阶Solo" disabled />
          </div>
        </div>
      </div>

      {/* 状态指示器 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-gray-700'}`} />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {isListening ? 'Live' : 'Standby'}
          </span>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navigation;