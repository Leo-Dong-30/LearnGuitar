/**
 * theoryEngine.js - 乐理推导计算引擎
 * * 核心职责：
 * 1. 调式推演：基于选定的根音（Root）与模式（Pattern），映射出所有目标半音序列。
 * 2. 几何定位：将抽象的乐理结构（音阶/和弦）转换为指板上的物理坐标（弦/品）。
 * 3. 音程分析：实时计算每个位置相对于根音的度数（Interval），如大三度、纯五度等。
 * * 数学原理：
 * 利用 12 平均律的同构性，通过“（根音索引 + 模式偏移）mod 12”计算目标音名。
 */
import { NOTES, FRETBOARD_FREQS, SCALES, CHORDS, INTERVAL_MAP } from '../constants/musicConfig';
import { audioEngine } from './audioEngine';

/**
 * getTheoryPositions - 获取特定音阶或和弦在指板上的全量分布
 * * @param {string} rootNote - 根音名称 (例如: "C", "G#")
 * @param {string} typeName - 结构名称 (对应 SCALES 或 CHORDS 中的键名)
 * @param {boolean} isScale - 模式切换 (true: 计算音阶, false: 计算和弦)
 * @returns {Array<Object>} 包含位置坐标与乐理信息的数组
 * 结构：[{ s: 弦, f: 品, note: 音名, interval: 音程级数, isRoot: 是否根音 }]
 */
export const getTheoryPositions = (rootNote, typeName, isScale = true) => {
  const rootIdx = NOTES.indexOf(rootNote);
  // 根据模式选择对应的半音步长公式
  const pattern = isScale ? SCALES[typeName] : CHORDS[typeName];
  
  if (rootIdx === -1 || !pattern) return [];

  /**
   * 1. 预处理：计算目标调式包含的所有半音索引 (0-11)
   * 示例：若 Root 为 D (索引 2)，模式为 Major [0, 2, 4, 5, 7, 9, 11]
   * 结果：[2, 4, 6, 7, 9, 11, 1] (对应 D, E, F#, G, A, B, C#)
   */
  const targetNoteIndices = pattern.map(interval => (rootIdx + interval) % 12);

  const results = [];

  /**
   * 2. 空间遍历：扫描指板频率矩阵
   * 维度：[6条琴弦] x [15个品格 (含空弦 0 品)]
   */
  FRETBOARD_FREQS.forEach((stringFreqs, sIdx) => {
    stringFreqs.forEach((freq, fIdx) => {
      // 通过音频引擎将频率逆向转换为标准音名索引
      const noteName = audioEngine.getNoteFromFreq(freq);
      const noteIdx = NOTES.indexOf(noteName);

      /**
       * 3. 匹配与标注逻辑：
       * 检查当前品位的音符是否存在于“目标调式”列表中
       */
      if (targetNoteIndices.includes(noteIdx)) {
        // 计算当前音符相对于根音的半音间距 (度数)
        const relativeInterval = (noteIdx - rootIdx + 12) % 12;
        
        results.push({
          s: sIdx,                                    // 物理弦位
          f: fIdx,                                    // 物理品位
          note: noteName,                             // 绝对音名
          interval: INTERVAL_MAP[relativeInterval],   // 功能音程缩写 (如: R, b3, 5)
          isRoot: relativeInterval === 0              // 标记是否为该结构的起始点（用于特殊高亮）
        });
      }
    });
  });

  return results;
};