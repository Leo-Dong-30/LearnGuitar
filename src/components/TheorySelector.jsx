import React from 'react';
import { BookOpen } from 'lucide-react';
import { NOTES, SCALES, CHORDS } from '../constants/musicConfig';

/**
 * TheorySelector 组件 - 乐理配置面板
 * * 功能：
 * 1. 根音 (Root) 选择：C, C#, D...
 * 2. 模式切换：音阶 (Scales) 与 和弦 (Chords) 的二选一逻辑
 * 3. 类型细分：根据模式动态加载具体的音阶名或和弦名
 */

const TheorySelector = ({ theoryConfig, setTheoryConfig }) => {
  return (
    <div className="lg:col-span-2 bg-gray-900/40 p-5 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl flex flex-wrap gap-6 items-end">
      {/* 标题与根音选择 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-blue-400">
          <BookOpen size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Theory Layer</span>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">根音</label>
            <select 
              className="bg-gray-800/80 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none appearance-none min-w-[80px]"
              value={theoryConfig.root}
              onChange={(e) => setTheoryConfig({...theoryConfig, root: e.target.value})}
            >
              {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* 音阶/和弦 切换切换器 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">类别</label>
            <div className="flex bg-gray-800/80 rounded-lg border border-gray-700 p-1">
              <button 
                onClick={() => setTheoryConfig({...theoryConfig, isScale: true, type: Object.keys(SCALES)[0]})} 
                className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${theoryConfig.isScale ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                音阶
              </button>
              <button 
                onClick={() => setTheoryConfig({...theoryConfig, isScale: false, type: Object.keys(CHORDS)[0]})} 
                className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${!theoryConfig.isScale ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                和弦
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 结构下拉菜单 */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
        <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">结构选择</label>
        <select 
          className="bg-gray-800/80 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 outline-none" 
          value={theoryConfig.type} 
          onChange={(e) => setTheoryConfig({...theoryConfig, type: e.target.value})}
        >
          {Object.keys(theoryConfig.isScale ? SCALES : CHORDS).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TheorySelector;