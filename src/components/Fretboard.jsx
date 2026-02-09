import React from 'react';
import { STRINGS, FRET_COUNT, NOTES } from '../constants/musicConfig';

/**
 * Fretboard 组件 - 吉他指板交互中心
 * * 功能描述：
 * 1. 视觉呈现：模拟吉他指板，包括琴枕(Nut)、品丝(Frets)、品位记号点(Inlays)及六根琴线。
 * 2. 交互逻辑：响应用户点击品格发声。
 * 3. 状态显示：实时高亮当前识别/播放的音符，并根据乐理配置显示辅助音程提示。
 * * 渲染层次：
 * 1. 背景层：指板主体、金属品丝与品数标注。
 * 2. 装饰层：3, 5, 7, 9, 12, 15 品位的记号圆点。
 * 3. 弦线层：粗细不一的琴弦视觉线条。
 * 4. 交互音符层：可点击的透明热区及动态音符 UI（Active/Guide 状态）。
 * * @param {Function} onNotePlay - 点击品格的回调函数 (stringIdx, fretIdx) => void
 * @param {Array} activePositions - 当前激活/发声的位置列表 [{s: 弦索引, f: 品索引, isCorrectHint: 布尔值}]
 * @param {Array} guidePositions - 乐理引擎生成的提示位置列表 [{s, f, interval, isRoot}]
 */

const Fretboard = ({ onNotePlay, activePositions = [], guidePositions = [] }) => {
  // 0 品（琴枕）占据指板总宽度的百分比
  const NUT_WIDTH_PERCENT = 5; 

  return (
    <div className="w-full py-10 px-2 select-none">
      {/* --- 指板主体容器：极简深色背景与微边框 --- */}
      <div className="relative w-full h-48 md:h-64 bg-[#121212] rounded-xl border border-white/5 shadow-xl flex flex-col justify-between py-1 overflow-hidden">
        
        {/* --- 1. 背景层：品丝与微型装饰点 --- */}
        <div className="absolute inset-0 flex">
          {/* 琴枕 (Nut) */}
          <div 
            style={{ width: `${NUT_WIDTH_PERCENT}%` }} 
            className="h-full border-r-2 border-amber-600/60 bg-white/5 relative"
          >
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-amber-700 font-medium tracking-widest opacity-80">NUT</span>
          </div>
          
          {/* 品格格栅与数字标注 */}
          {Array.from({ length: FRET_COUNT }).map((_, i) => (
            <div key={i + 1} className="flex-1 h-full border-r border-white/5 relative">
              {/* 品数编号 (1, 2, 3...) */}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-gray-700 font-mono tracking-tighter">{i + 1}</span>
              
              {/* 品位装饰点 (Inlays)：改为极小实心点 */}
              {[3, 5, 7, 9, 12, 15].includes(i + 1) && (
                <div className={`absolute left-1/2 -translate-x-1/2 w-1 h-1 bg-white/10 rounded-full ${i + 1 === 12 ? 'top-[33%] mb-4' : 'top-1/2 -translate-y-1/2'}`} />
              )}
              {i + 1 === 12 && (
                <div className="absolute top-[66%] left-1/2 -translate-x-1/2 w-1 h-1 bg-white/10 rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* --- 2. 交互层：极细琴弦与音符交互单元格 --- */}
        <div className="absolute inset-0 flex flex-col justify-between py-3 z-10">
          {STRINGS.map((string, sIdx) => (
            <div key={sIdx} className="relative w-full h-[14%] flex items-center group">
              
              {/* 琴弦线条：改为高透明度的实线条，模拟极简质感 */}
              <div 
                className="absolute w-full bg-white/10 pointer-events-none" 
                style={{ height: `${0.5 + sIdx * 0.3}px` }} 
              />
              
              {/* 品格交互网格 (0品至最大品数) */}
              <div className="flex w-full h-full">
                {Array.from({ length: FRET_COUNT + 1 }).map((_, fIdx) => {
                  const activeInfo = activePositions.find(p => p.s === sIdx && p.f === fIdx);
                  const guideInfo = guidePositions.find(p => p.s === sIdx && p.f === fIdx);
                  
                  const isActive = !!activeInfo;
                  const isCorrectHint = activeInfo?.isCorrectHint;
                  const isGuide = !!guideInfo;
                  const isRoot = guideInfo?.isRoot;

                  const noteIndex = (NOTES.indexOf(string.note) + fIdx) % 12;
                  const noteName = NOTES[noteIndex];

                  return (
                    <div 
                      key={fIdx} 
                      onClick={() => onNotePlay(sIdx, fIdx)} 
                      style={{ width: fIdx === 0 ? `${NUT_WIDTH_PERCENT}%` : `${(100 - NUT_WIDTH_PERCENT) / FRET_COUNT}%` }}
                      className="h-full cursor-pointer flex items-center justify-center relative group/note"
                    >
                      {/* C. 音符渲染逻辑：降低视觉对比度，强化扁平感 */}
                      <div className={`
                        w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 rounded-full transition-all duration-200 flex items-center justify-center text-[9px] md:text-[11px] font-bold z-20
                        ${isCorrectHint
                          ? 'bg-green-600 text-white scale-110 shadow-lg shadow-green-900/40 animate-pulse' // 正确提示：稳定绿
                          : isActive 
                            ? 'bg-white text-black scale-105' // 激活：明亮对比
                            : isGuide 
                              ? isRoot
                                ? 'bg-[#222] text-amber-500 border border-amber-600/40' // 根音：沉稳橙
                                : 'bg-[#1a1a1a] text-gray-500 border border-white/5' // 引导：灰调
                              : 'bg-transparent text-transparent group-hover/note:bg-white/5 group-hover/note:text-white/40'} 
                      `}>
                        {(isGuide && !isActive) ? guideInfo.interval : noteName}
                      </div>

                      {/* D. 提示动画：移除背景模糊，改为简单的圆环 */}
                      {isCorrectHint && (
                        <div className="absolute inset-0 border-2 border-green-600/20 rounded-full scale-125 animate-ping pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Fretboard;