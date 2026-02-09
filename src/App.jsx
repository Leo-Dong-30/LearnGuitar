import React, { useState, useEffect, useCallback } from 'react';

// 配置与常量
import { KEYBOARD_MAP, FRETBOARD_FREQS, STRINGS, NOTES } from './constants/musicConfig'; // 增加导入 STRINGS, NOTES
import { getTheoryPositions } from './services/theoryEngine'; 

// UI 组件
import Navigation from './components/Navigation';
import Fretboard from './components/Fretboard';
import IntervalMap from './components/IntervalMap';
import TheorySelector from './components/TheorySelector';
import MetronomePanel from './components/MetronomePanel';
import PracticeStats from './components/PracticeStats';

// 自定义 Hooks
import { useMetronome } from './hooks/useMetronome';
import { usePitchDetection } from './hooks/usePitchDetection';
import { useGuitarActions } from './hooks/useGuitarActions';

// 引入练习引擎以获取当前题目目标
import { exerciseEngine } from './services/exerciseEngine';

export default function App() {
  const [mode, setMode] = useState('explore');
  
  // --- 1. 核心状态 ---
  const [theoryConfig, setTheoryConfig] = useState({root: 'C', type: 'Major (Ionian)', isScale: true});
  const [guidePositions, setGuidePositions] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [mapPos, setMapPos] = useState({ x: 50, y: 150 });
  const [isDragging, setIsDragging] = useState(false);

  // --- 2. 逻辑 Hook 实例化 ---
  const { 
    isListening, activeNote, activePositions, 
    setActiveNote, setActivePositions, startDetection, stopDetection 
  } = usePitchDetection();
  
  const { 
    exerciseScore, lastFeedback, attempts, // 引入 attempts 状态
    playNote, startEarTraining, setExerciseType 
  } = useGuitarActions(mode, guidePositions);

  const { bpm, isMetronomePlaying, toggleMetronome, updateBpm } = useMetronome(100);

  // --- 3. 副作用处理 ---

  // 乐理位置实时计算
  useEffect(() => {
    const positions = getTheoryPositions(theoryConfig.root, theoryConfig.type, theoryConfig.isScale);
    setGuidePositions(positions);
  }, [theoryConfig]);

  // 键盘模式下的视觉同步
  useEffect(() => {
    if (mode !== 'keyboard') return;
    const newPositions = Array.from(pressedKeys)
      .map(key => KEYBOARD_MAP[key])
      .filter(Boolean);
    setActivePositions(newPositions);
  }, [pressedKeys, mode, setActivePositions]);

  // --- 4. 交互处理 ---

  const handleFretClick = useCallback((sIdx, fIdx) => {
    const noteName = playNote(sIdx, fIdx);
    setActiveNote(noteName);

    if (mode !== 'practice') {
      // 探索模式逻辑
      setActivePositions([{ s: sIdx, f: fIdx }]);
      setTimeout(() => {
        setActiveNote(null);
        setActivePositions([]);
      }, 1500);
    } else {
      // --- 练习模式核心修复逻辑 ---
      const currentPos = [{ s: sIdx, f: fIdx }];

      // 实时校验当前点击是否正确
      const isCorrect = exerciseEngine.checkAnswer(sIdx, fIdx, STRINGS, NOTES);

      // 如果点击错误，且当前已经是第 2 次尝试 (attempts 为 1 表示这是第二次点击)
      if (!isCorrect && attempts === 1) {
        const target = exerciseEngine.currentQuestion;
        if (target) {
          // 将正确答案以“提示点”身份加入数组
          currentPos.push({ 
            s: target.sIdx, 
            f: target.fIdx, 
            isCorrectHint: true 
          });
        }
      }

      setActivePositions(currentPos);
      
      // 统一清理状态，时间稍长以确保用户看清纠正点
      setTimeout(() => {
        setActiveNote(null);
        setActivePositions([]);
      }, 3000);
    }
  }, [mode, playNote, setActiveNote, setActivePositions, attempts]); // 移除了对异步 lastFeedback 的依赖

  const handleMouseDown = (e) => {
    const handle = e.target.closest('.drag-container');
    if (!handle) return;
    setIsDragging(true);
    const startX = e.clientX - mapPos.x;
    const startY = e.clientY - mapPos.y;
    
    const onMouseMove = (me) => setMapPos({ x: me.clientX - startX, y: me.clientY - startY });
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setIsDragging(false);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode !== 'keyboard') return;
      const key = e.key.toLowerCase();
      if (KEYBOARD_MAP[key] && !pressedKeys.has(key)) {
        setPressedKeys(prev => new Set(prev).add(key));
        playNote(KEYBOARD_MAP[key].s, KEYBOARD_MAP[key].f);
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (pressedKeys.has(key)) {
        setPressedKeys(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, pressedKeys, playNote]);

return (
  /* --- 根容器：定义全局背景、文字颜色及防溢出布局 --- */
  <div className="min-h-screen bg-[#0f0f0f] text-gray-200 font-sans overflow-hidden">
    
    {/* 1. 顶部导航模块：控制应用全局模式 (Mode) 与 核心引擎的启停开关 */}
    <Navigation 
      mode={mode} setMode={setMode}
      isListening={isListening}
      stopDetection={stopDetection} startDetection={startDetection}
      setPressedKeys={setPressedKeys} setExerciseType={setExerciseType}
      setShowHints={setShowHints} startEarTraining={startEarTraining}
    />

    <main className="pt-28 pb-12 flex flex-col items-center max-w-7xl mx-auto px-6 min-h-screen">
      

      {/* 2. 配置交互面板：包含乐理选择 (Theory) 与 节拍器 (Metronome)*/}
      <div className={`w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-end transition-opacity duration-500 ${mode === 'practice' ? 'opacity-60' : 'opacity-100'}`}>
        <TheorySelector theoryConfig={theoryConfig} setTheoryConfig={setTheoryConfig} />
        <MetronomePanel bpm={bpm} isMetronomePlaying={isMetronomePlaying} toggleMetronome={toggleMetronome} updateBpm={updateBpm} />
      </div>

      {/* 3. 练习状态看板：仅在 'practice' 模式下挂载，展示得分、正确率及辅助开关 */}
      {mode === 'practice' && (
        <PracticeStats 
          exerciseScore={exerciseScore} 
          showHints={showHints} 
          setShowHints={setShowHints} 
        />
      )}

      {/* 4. 悬浮音程映射图：支持自由拖拽，实时显示当前触发音符的音程关系 (Interval Relations) */}
      <div 
        onMouseDown={handleMouseDown} 
        className={`fixed z-[60] drag-container transition-transform ${isDragging ? 'scale-105 cursor-grabbing' : 'cursor-grab hover:scale-[1.02]'}`} 
        style={{ left: mapPos.x, top: mapPos.y }}
      >
        <IntervalMap activeNote={activeNote} />
      </div>

      {/* 5. 核心指板交互区：
          - 容器层：负责渲染练习模式下的正确/错误视觉反馈 (lastFeedback)
          - 组件层：渲染吉他品格，并根据当前模式过滤显示“引导位置” (guidePositions) */}
      <div className="w-full relative group">
        {/* 练习反馈光晕特效 */}
        {lastFeedback && (
          <div className={`absolute -inset-4 rounded-[2rem] border-4 transition-all duration-300 animate-pulse z-40 pointer-events-none ${lastFeedback === 'correct' ? 'border-green-500/30' : 'border-red-500/30'}`} />
        )}
        
        <Fretboard 
          onNotePlay={handleFretClick} 
          activePositions={activePositions} 
          // 逻辑判定：练习模式下根据 showHints 开关决定是否显示提示点，其他模式常驻显示
          guidePositions={mode === 'practice' ? (showHints ? guidePositions : []) : guidePositions}          
        />
      </div>

      {/* 6. 底部信息层：装饰性文字，标识当前运行状态 */}
      <footer className="mt-12 flex flex-col items-center gap-2 opacity-30">
         <div className="flex items-center gap-4 text-gray-600">
           <div className="h-px w-12 bg-gray-800" />
           <p className="text-[10px] font-bold uppercase tracking-[0.4em]">
              {mode.replace('-', ' ')} Mode
           </p>
           <div className="h-px w-12 bg-gray-800" />
         </div>
      </footer>
    </main>
  </div>
);
}