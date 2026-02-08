import React from 'react';
import { NOTES } from '../constants/musicConfig';

/**
 * IntervalMap 组件 - 悬浮音程环
 * * 职责：
 * 1. 将 12 个半音映射到 360 度圆环
 * 2. 突出显示当前活动的音符 (activeNote)
 * 3. 作为悬浮窗支持拖拽移动 (拖拽逻辑在 App.jsx 实现)
 */

const IntervalMap = ({ activeNote }) => {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center bg-gray-900/40 rounded-full border border-gray-800 shadow-2xl backdrop-blur-md overflow-visible">
      
      {/* 背景圆环刻度 */}
      <div className="absolute inset-0">
        {NOTES.map((note, i) => {
          const angle = (i * 30) - 90;
          const isActive = note === activeNote;
          
          return (
            <div 
              key={`marker-${note}`}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {/* 音调文字标签 - 增加距离确保不会被切断 */}
              <div 
                className="absolute transition-all duration-300 flex flex-col items-center"
                style={{ 
                  transform: `rotate(${angle}deg) translate(62px) rotate(${-angle}deg)` 
                }}
              >
                <span className={`text-[11px] font-black tracking-tighter ${
                  isActive ? 'text-blue-400 scale-125' : 'text-gray-700'
                }`}>
                  {note}
                </span>
                
                {/* 小刻度线 */}
                <div className={`w-1 h-1 rounded-full mt-1 ${
                  isActive ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-gray-800'
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 指示球 (渲染在文字后面) */}
      {activeNote && (
        <div 
          className="absolute w-12 h-12 bg-blue-600/20 rounded-full blur-xl transition-all duration-500 ease-out z-0"
          style={{ 
            transform: `rotate(${NOTES.indexOf(activeNote) * 30 - 90}deg) translate(62px)` 
          }}
        />
      )}

      {/* 中心显示区域 - 确保唯一渲染 */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Pitch</div>
        <div className="h-10 flex items-center justify-center">
          {activeNote ? (
            <span className="text-3xl font-black text-white tracking-tighter animate-in fade-in zoom-in duration-200">
              {activeNote}
            </span>
          ) : (
            <span className="text-xl font-bold text-gray-700 tracking-tighter">--</span>
          )}
        </div>
      </div>

      {/* 装饰性外环 */}
      <div className="absolute inset-2 border border-gray-800/50 rounded-full pointer-events-none" />
    </div>
  );
};

export default IntervalMap;