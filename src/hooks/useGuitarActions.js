import { useState, useCallback } from 'react';
import { audioEngine } from '../services/audioEngine';
import { exerciseEngine } from '../services/exerciseEngine';

/**
 * useGuitarActions - 自定义 Hook：管理吉他交互行为与练习逻辑
 * * 职责：
 * 1. 桥接 View 层与 Engine 层：处理点击发声并同步练习状态。
 * 2. 练习流程控制：初始化题目、校验答案、自动跳转下一题。
 * 3. 成绩追踪：记录练习的总次数与正确次数。
 * * @param {string} mode - 当前应用的主模式 (explore/practice等)
 * @param {Array} theoryPositions - 当前乐理引擎生成的引导位置，用于收窄练习范围
 */
export const useGuitarActions = (mode, theoryPositions) => {
  // --- 1. 练习相关内部状态 ---
  const [exerciseType, setExerciseType] = useState(null);       // 当前练习子类型 (如 'ear-training')
  const [exerciseScore, setExerciseScore] = useState({ total: 0, correct: 0 }); // 成绩统计
  const [lastFeedback, setLastFeedback] = useState(null);      // 交互反馈：'correct' | 'wrong'

  /**
   * 辅助函数：进入下一题
   * 逻辑：清空反馈状态 -> 引擎生成新题 -> 延迟 0.5s 播放音讯
   */
  const nextQuestion = useCallback(() => {
    setLastFeedback(null);
    const q = exerciseEngine.generateQuestion(theoryPositions);
    
    // 延迟播放：确保用户在视觉上感知到反馈结束后，再开始听觉测试
    setTimeout(() => {
      audioEngine.play(q.sIdx, q.fIdx);
    }, 500);
  }, [theoryPositions]);

  /**
   * 核心方法：启动盲听练习 (Ear Training)
   * 逻辑：切换 App 模式 -> 初始化计分板 -> 播放首个题目
   */
  const startEarTraining = useCallback((setAppMode) => {
    setAppMode('practice');
    setExerciseType('ear-training');
    setExerciseScore({ total: 0, correct: 0 });
    
    setLastFeedback(null);
    const q = exerciseEngine.generateQuestion(theoryPositions);
    setTimeout(() => {
      audioEngine.play(q.sIdx, q.fIdx);
    }, 500);
  }, [theoryPositions]);

  /**
   * 核心方法：执行发声逻辑 (playNote)
   * * 职责：
   * 1. 调用音频引擎产生声音。
   * 2. 拦截判断：若处于练习模式，校验用户的点击坐标是否匹配题目。
   * 3. 状态更新：实时反馈对错并触发 1.5s 后的自动切题逻辑。
   * * @param {number} sIdx - 弦索引 (0-5)
   * @param {number} fIdx - 品索引 (0-15)
   * @returns {string} - 返回当前音名 (如 'C#')，供外部设置活动音符状态
   */
  const playNote = useCallback((sIdx, fIdx) => {
    // 调用底层音频引擎发声
    const note = audioEngine.play(sIdx, fIdx);

    // --- 练习模式判定分支 ---
    if (mode === 'practice' && exerciseType === 'ear-training') {
      // 校验答案：由 exerciseEngine 执行逻辑判断
      const isCorrect = exerciseEngine.checkAnswer(sIdx, fIdx);
      
      // 更新即时反馈视觉状态
      setLastFeedback(isCorrect ? 'correct' : 'wrong');
      
      // 更新成绩累计
      setExerciseScore(prev => ({
        total: prev.total + 1,
        correct: isCorrect ? prev.correct + 1 : prev.correct
      }));
      
      // 节奏控制：用户操作后等待 1.5s 自动进入下一题，保持练习连贯性
      setTimeout(nextQuestion, 1500);
      return note;
    }

    // 自由探索模式下，直接返回音名
    return note;
  }, [mode, exerciseType, nextQuestion]);

  // 对外暴露的状态与控制方法
  return {
    exerciseType,
    setExerciseType,
    exerciseScore,
    setExerciseScore,
    lastFeedback,
    setLastFeedback,
    playNote,
    startEarTraining,
    nextQuestion
  };
};