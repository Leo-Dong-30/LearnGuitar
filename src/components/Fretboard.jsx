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
 * @param {Array} activePositions - 当前激活/发声的位置列表 [{s: 弦索引, f: 品索引}]
 * @param {Array} guidePositions - 乐理引擎生成的提示位置列表 [{s, f, interval, isRoot}]
 */
const Fretboard = ({ onNotePlay, activePositions = [], guidePositions = [] }) => {
  // 0 品（琴枕）占据指板总宽度的百分比
  const NUT_WIDTH_PERCENT = 5; 

  return (
    <div className="w-full py-10 px-2 select-none">
      {/* --- 指板主体容器：处理渐变背景与圆角阴影 --- */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-xl border-y-2 border-gray-800 shadow-2xl flex flex-col justify-between py-1 overflow-hidden">
        
        {/* --- 1. 背景层：绘制琴枕、品丝与品位装饰点 --- */}
        <div className="absolute inset-0 flex">
          {/* 琴枕 (Nut) */}
          <div 
            style={{ width: `${NUT_WIDTH_PERCENT}%` }} 
            className="h-full border-r-[3px] border-amber-500/80 bg-black/40 relative"
          >
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] text-amber-600 font-bold tracking-tighter">NUT</span>
          </div>
          
          {/* 品格格栅与数字标注 */}
          {Array.from({ length: FRET_COUNT }).map((_, i) => (
            <div key={i + 1} className="flex-1 h-full border-r border-white/10 relative">
              {/* 品数编号 (1, 2, 3...) */}
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] text-gray-600 font-mono">{i + 1}</span>
              
              {/* 品位装饰点 (Inlays)：常规品位显示单点，12品显示双点 */}
              {[3, 5, 7, 9, 12, 15].includes(i + 1) && (
                <div className={`absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-white/5 rounded-full ring-1 ring-white/5 ${i + 1 === 12 ? 'top-[33%] mb-4' : 'top-1/2 -translate-y-1/2'}`} />
              )}
              {i + 1 === 12 && (
                <div className="absolute top-[66%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-white/5 rounded-full ring-1 ring-white/5" />
              )}
            </div>
          ))}
        </div>

        {/* --- 2. 交互层：琴弦绘制与音符交互单元格 --- */}
        <div className="absolute inset-0 flex flex-col justify-between py-3 z-10">
          {STRINGS.map((string, sIdx) => (
            <div key={sIdx} className="relative w-full h-[14%] flex items-center group">
              
              {/* 琴弦线条：根据弦号 (sIdx) 动态增加高度，模拟从细到粗的视觉效果 */}
              <div 
                className="absolute w-full bg-gradient-to-r from-gray-600 via-gray-400 to-gray-700 shadow-[0_1px_1px_rgba(0,0,0,0.8)] pointer-events-none" 
                style={{ height: `${0.5 + sIdx * 0.4}px` }} 
              />
              
              {/* 品格交互网格 (0品至最大品数) */}
              <div className="flex w-full h-full">
                {Array.from({ length: FRET_COUNT + 1 }).map((_, fIdx) => {
                  // A. 状态匹配：检查当前品格是否处于“激活”或“乐理引导”状态
                  const activeInfo = activePositions.find(p => p.s === sIdx && p.f === fIdx);
                  const guideInfo = guidePositions.find(p => p.s === sIdx && p.f === fIdx);
                  
                  const isActive = !!activeInfo;      // 当前正在按/识别
                  const isGuide = !!guideInfo;        // 属于当前选定的音阶/和弦
                  const isRoot = guideInfo?.isRoot;   // 是否为根音

                  // B. 音名推算：根据弦根音与品数计算当前格子的音名
                  const noteIndex = (NOTES.indexOf(string.note) + fIdx) % 12;
                  const noteName = NOTES[noteIndex];

                  return (
                    <div 
                      key={fIdx} 
                      onClick={() => onNotePlay(sIdx, fIdx)} 
                      style={{ width: fIdx === 0 ? `${NUT_WIDTH_PERCENT}%` : `${(100 - NUT_WIDTH_PERCENT) / FRET_COUNT}%` }}
                      className="h-full cursor-pointer flex items-center justify-center relative group/note"
                    >
                      {/* C. 音符渲染逻辑：根据状态应用不同的视觉样式 (Active > Guide > Hidden) */}
                      <div className={`
                        w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full transition-all duration-300 flex items-center justify-center text-[8px] md:text-[10px] font-black z-20
                        ${isActive 
                          ? 'bg-blue-500 text-white scale-110 shadow-[0_0_15px_rgba(59,130,246,0.6)]' // 激活状态：蓝色发光
                          : isGuide 
                            ? isRoot
                              ? 'bg-amber-500/20 text-amber-500 border-2 border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]' // 根音：橙色边框
                              : 'bg-white/5 text-gray-400 border border-white/20' // 引导音：低调白框
                            : 'bg-black/10 text-transparent border border-white/5 group-hover/note:bg-white/10 group-hover/note:text-white/70'} // 隐藏状态：仅在 Hover 时显现
                      `}>
                        {/* 文字内容：引导模式下显示音程级数 (如 R, 3, 5)，播放/识别模式显示真实音名 (如 C, G) */}
                        {(isGuide && !isActive) ? guideInfo.interval : noteName}
                      </div>

                      {/* D. 根音光晕：为乐理根音提供额外的背景模糊层以增加层次感 */}
                      {isRoot && isGuide && !isActive && (
                        <div className="absolute inset-0 bg-amber-500/5 blur-md rounded-full scale-150 pointer-events-none" />
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