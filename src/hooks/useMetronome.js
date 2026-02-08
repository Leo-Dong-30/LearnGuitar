import { useState, useCallback } from 'react';
import { metronomeEngine } from '../services/metronomeEngine';
import { audioEngine } from '../services/audioEngine';

/**
 * useMetronome - 自定义 Hook：管理节拍器的业务逻辑与引擎状态同步
 * * 职责：
 * 1. 状态维护：管理 BPM 数值及节拍器的运行/停止状态。
 * 2. 引擎交互：桥接 UI 操作到底层 `metronomeEngine`，处理音频上下文分配。
 * 3. 实时同步：确保在运行期间动态调整 BPM 时，底层引擎能立即响应。
 * * @param {number} initialBpm - 初始每分钟节拍数 (默认 100)
 */
export const useMetronome = (initialBpm = 100) => {
  // --- 内部状态 ---
  const [bpm, setBpm] = useState(initialBpm);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);

  /**
   * 核心逻辑：开关切换节拍器
   * 逻辑流程：
   * 1. 交互激活：由于浏览器安全策略，必须在用户点击时调用 `audioEngine.init()` 激活 AudioContext。
   * 2. 引擎配置：启动前将全局音频上下文引用传递给节拍器引擎。
   * 3. 状态翻转：根据当前 `isMetronomePlaying` 执行 start 或 stop。
   */
  const toggleMetronome = useCallback(() => {
    // 确保底层 Web Audio API 的 AudioContext 已初始化并脱离挂起状态
    audioEngine.init();

    if (isMetronomePlaying) {
      metronomeEngine.stop();
    } else {
      // 共享主音频引擎的上下文，避免重复创建 AudioContext 导致性能损耗
      metronomeEngine.audioCtx = audioEngine.audioCtx;
      metronomeEngine.start(bpm);
    }
    
    // 同步 UI 状态
    setIsMetronomePlaying(prev => !prev);
  }, [isMetronomePlaying, bpm]);

  /**
   * 处理函数：更新 BPM 数值
   * 逻辑说明：
   * 1. 类型转换：确保输入值为整数。
   * 2. 动态调节：如果节拍器正在运行，直接修改引擎内部的 `bpm` 属性（引擎内部应有计算间隔的逻辑）。
   * @param {number|string} newBpm - 新的 BPM 值
   */
  const updateBpm = useCallback((newBpm) => {
    const val = parseInt(newBpm);
    setBpm(val);
    
    // 如果引擎正在运行，同步更新引擎的时钟间隔
    if (isMetronomePlaying) {
      metronomeEngine.bpm = val;
    }
  }, [isMetronomePlaying]);

  // 对外暴露的状态与控制接口
  return {
    bpm,                // 当前速度
    isMetronomePlaying, // 播放状态标识
    toggleMetronome,    // 切换方法
    updateBpm           // 调速方法
  };
};