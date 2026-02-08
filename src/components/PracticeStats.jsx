import React from 'react';
import { Trophy } from 'lucide-react';

/**
 * PracticeStats 组件 - 盲听练习成绩看板
 * * 功能：
 * 1. 计算并显示练习正确率 (Accuracy)
 * 2. 实时记录得分 (Correct / Total)
 * 3. 控制练习过程中的“参考提示”显隐
 */

const PracticeStats = ({ exerciseScore, showHints, setShowHints }) => {
  const accuracy = exerciseScore.total === 0 
    ? 0 
    : Math.round((exerciseScore.correct / exerciseScore.total) * 100);

  return (
    <div className="w-full mb-8 bg-amber-600/10 border border-amber-600/20 p-4 rounded-2xl flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-500 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white shadow-lg">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase text-amber-500 tracking-tighter">盲听挑战</h3>
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="checkbox" 
              id="hint-toggle" 
              checked={showHints} 
              onChange={(e) => setShowHints(e.target.checked)} 
              className="w-3 h-3 accent-amber-500 cursor-pointer" 
            />
            <label htmlFor="hint-toggle" className="text-[10px] text-gray-400 font-bold uppercase cursor-pointer hover:text-amber-500 transition-colors">
              显示参考点
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="text-right">
          <span className="block text-[9px] text-gray-600 font-black uppercase">Accuracy</span>
          <span className="text-2xl font-black text-white italic">{accuracy}%</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] text-gray-600 font-black uppercase">Score</span>
          <span className="text-2xl font-black text-white italic">
            {exerciseScore.correct} / {exerciseScore.total}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PracticeStats;