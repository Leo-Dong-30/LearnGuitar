import { useState, useRef, useCallback, useEffect } from 'react';
import { audioEngine } from '../services/audioEngine';
import { FRETBOARD_FREQS } from '../constants/musicConfig';

/**
 * usePitchDetection - 自定义 Hook：实时音频频率分析与吉他音位映射
 * * 核心职责：
 * 1. 硬件接入：获取并管理麦克风流（MediaStream）。
 * 2. 实时分析：通过 Web Audio API 进行时域采样，利用自相关算法 (Autocorrelation) 提取基频。
 * 3. 物理映射：将检测到的频率匹配至吉他指板的具体品位（Positions）。
 * 4. 资源清理：确保在组件卸载或停止时，释放麦克风资源并停止动画帧。
 */
export const usePitchDetection = () => {
  // --- UI 状态 ---
  const [isListening, setIsListening] = useState(false);      // 监听状态开关
  const [activeNote, setActiveNote] = useState(null);          // 当前识别到的音名 (如 "C#")
  const [activePositions, setActivePositions] = useState([]);  // 匹配到的指板坐标数组 [{s, f}]

  // --- 引擎引用 (持久化引用，不触发重绘) ---
  const analyzerRef = useRef(null);      // Web Audio 分析器节点
  const animationRef = useRef(null);     // requestAnimationFrame 句柄
  const micStreamRef = useRef(null);     // 麦克风媒体流引用

  /**
   * 核心循环：高频采样分析 (典型频率 60fps)
   * 优化：将高耗能的频率匹配逻辑进行范围限定，避免无效计算
   */
  const loop = useCallback(() => {
    if (!analyzerRef.current) return;

    // 获取时域数据：将波形数据填充入缓冲区
    const buffer = new Float32Array(analyzerRef.current.fftSize);
    analyzerRef.current.getFloatTimeDomainData(buffer);
    
    // 执行算法：从波形中计算基频 (Hz)
    const pitch = audioEngine.autoCorrelate(buffer, audioEngine.audioCtx.sampleRate);

    // 过滤：仅处理吉他音域内的频率 (E2 ~ 约 1200Hz)
    if (pitch !== -1 && pitch > 60 && pitch < 1200) {
      // 1. 获取最接近的科学音名
      const note = audioEngine.getNoteFromFreq(pitch);
      setActiveNote(note);

      // 2. 指板位置匹配优化：
      // 遍历预计算的频率矩阵，寻找与当前频率误差在 3% (约半个半音) 以内的品位
      const matchedPositions = [];
      for (let sIdx = 0; sIdx < FRETBOARD_FREQS.length; sIdx++) {
        for (let fIdx = 0; fIdx < FRETBOARD_FREQS[sIdx].length; fIdx++) {
          const fFreq = FRETBOARD_FREQS[sIdx][fIdx];
          // 采用相对误差判断，适应高低频不同的敏感度
          if (Math.abs(fFreq - pitch) < (pitch * 0.03)) {
            matchedPositions.push({ s: sIdx, f: fIdx });
          }
        }
      }
      setActivePositions(matchedPositions);
    }
    
    // 递归调用，维持分析循环
    animationRef.current = requestAnimationFrame(loop);
  }, []);

  /**
   * 停止逻辑：释放硬件占用与内存清理
   */
  const stopDetection = useCallback(() => {
    // 释放麦克风硬件资源，关闭指示灯
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    // 取消尚未执行的动画帧，防止内存泄漏
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    analyzerRef.current = null;
    setIsListening(false);
    setActiveNote(null);
    setActivePositions([]);
  }, []);

  /**
   * 启动逻辑：异步初始化音频链路
   */
  const startDetection = useCallback(async () => {
    try {
      // 初始化全局 AudioContext (需用户交互触发)
      audioEngine.init();
      
      const stream = await audioEngine.getMicStream();
      micStreamRef.current = stream;
      
      // 构建音频处理链: Mic Source -> Analyser
      const source = audioEngine.audioCtx.createMediaStreamSource(stream);
      const analyzer = audioEngine.audioCtx.createAnalyser();
      
      // FFTSize 决定了频率分辨率，2048 是识别吉他低音的最佳平衡点
      analyzer.fftSize = 2048; 
      source.connect(analyzer);
      
      analyzerRef.current = analyzer;
      setIsListening(true);
      
      // 启动识别循环
      loop(); 
    } catch (err) {
      console.error("[Pitch Detection] 启动失败:", err);
      setIsListening(false);
    }
  }, [loop]);

  /**
   * 生命周期管理：
   * 确保在组件销毁（如用户关闭应用或切换路由）时，彻底关闭麦克风
   */
  useEffect(() => {
    return () => stopDetection();
  }, [stopDetection]);

  return {
    isListening,
    activeNote,
    activePositions,
    setActiveNote,      // 暴露 Setter 供虚拟键盘等其他模式手动驱动 UI
    setActivePositions,
    startDetection,
    stopDetection
  };
};