/**
 * musicConfig.js - 全局乐理字典与硬件规格配置
 * * 职责：
 * 1. 物理建模：定义吉他弦数、品格数及标准调弦频率。
 * 2. 乐理映射：提供音程、音阶、和弦的数学构成（半音距离）。
 * 3. 预计算：生成指板全位置频率矩阵，优化实时运行性能。
 * 4. 交互映射：定义 PC 键盘到吉他品位的映射关系。
 */

/**
 * 1. 物理基础配置
 * STRINGS: 标准 EADGBE 调弦，从 1 弦（高音 E）到 6 弦（低音 E）
 * FRET_COUNT: 定义虚拟指板的可玩品数
 */
export const STRINGS = [
  { note: 'E', freq: 329.63 }, // 1弦 (High E)
  { note: 'B', freq: 246.94 }, // 2弦
  { note: 'G', freq: 196.00 }, // 3弦
  { note: 'D', freq: 146.83 }, // 4弦
  { note: 'A', freq: 110.00 }, // 5弦
  { note: 'E', freq: 82.41 }   // 6弦 (Low E)
];

export const FRET_COUNT = 15;

/**
 * 12 平均律音名序列
 * 用于将频率转换为音名，或计算半音偏移
 */
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * 2. 音程级数字典 (Intervals)
 * 键 (Key): 距离根音的半音数
 * 值 (Value): 音乐术语缩写。R 代表 Root（根音），b 代表降，# 代表升
 */
export const INTERVAL_MAP = {
  0: 'R',   1: 'b2',  2: '2',   3: 'b3',  
  4: '3',   5: '4',   6: '#4',  7: '5',   
  8: 'b6',  9: '6',   10: 'b7', 11: '7'
};

/**
 * 3. 音阶公式字典 (Scales)
 * 存储不同音阶的半音间隔序列 (Scale Degrees)
 * 例如：Major [全, 全, 半, 全, 全, 全, 半] 对应 [0, 2, 4, 5, 7, 9, 11]
 */
export const SCALES = {
  'Major (Ionian)': [0, 2, 4, 5, 7, 9, 11],
  'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
  'Major Pentatonic': [0, 2, 4, 7, 9],
  'Minor Pentatonic': [0, 3, 5, 7, 10],
  'Blues Scale': [0, 3, 5, 6, 7, 10],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11]
};

/**
 * 4. 和弦构成字典 (Chords)
 * 定义常见和弦的组成音程
 * 理论引擎会根据这些公式在指板上搜索匹配的音符组合
 */
export const CHORDS = {
  'Major Triad': [0, 4, 7],           // 大三和弦 (1-3-5)
  'Minor Triad': [0, 3, 7],           // 小三和弦 (1-b3-5)
  'Diminished': [0, 3, 6],            // 减三和弦 (1-b3-b5)
  'Augmented': [0, 4, 8],             // 增三和弦 (1-3-#5)
  'Major 7th (Maj7)': [0, 4, 7, 11],  // 大七和弦 (1-3-5-7)
  'Minor 7th (m7)': [0, 3, 7, 10],    // 小七和弦 (1-b3-5-b7)
  'Dominant 7th (7)': [0, 4, 7, 10],  // 属七和弦 (1-3-5-b7)
  'Minor 7th b5 (m7b5)': [0, 3, 6, 10], // 半减七和弦
  'Suspended 4th (sus4)': [0, 5, 7],  // 挂四和弦 (1-4-5)
  'Add 9': [0, 4, 7, 14]              // 加九和弦 (14 为 12+2)
};

/**
 * 5. 预计算：指板频率矩阵
 * 计算公式：f = f0 * 2^(n/12)
 * 生成一个 [弦Idx][品Idx] 的二维数组，避免在渲染循环中进行指数运算
 */
export const FRETBOARD_FREQS = STRINGS.map(s => {
  const freqs = [];
  for (let f = 0; f <= FRET_COUNT; f++) {
    freqs.push(s.freq * Math.pow(2, f / 12));
  }
  return freqs;
});

/**
 * 6. 物理键盘映射表
 * 将电脑键盘按键映射到特定的 { 弦(s), 品(f) }
 * 分为左手区和右手区，模拟吉他手的操作分布
 */
export const KEYBOARD_MAP = {
  // --- 左手区域 (主要映射低音弦 6, 5, 4) ---
  'z': { s: 5, f: 0 }, 'x': { s: 5, f: 1 }, 'c': { s: 5, f: 2 }, 'v': { s: 5, f: 3 }, 'b': { s: 5, f: 4 },
  'a': { s: 4, f: 0 }, 's': { s: 4, f: 1 }, 'd': { s: 4, f: 2 }, 'f': { s: 4, f: 3 }, 'g': { s: 4, f: 4 },
  'q': { s: 3, f: 0 }, 'w': { s: 3, f: 1 }, 'e': { s: 3, f: 2 }, 'r': { s: 3, f: 3 }, 't': { s: 3, f: 4 },

  // --- 右手区域 (主要映射高音弦 3, 2, 1) ---
  'y': { s: 2, f: 0 }, 'u': { s: 2, f: 1 }, 'i': { s: 2, f: 2 }, 'o': { s: 2, f: 3 }, 'p': { s: 2, f: 4 },
  'h': { s: 1, f: 0 }, 'j': { s: 1, f: 1 }, 'k': { s: 1, f: 2 }, 'l': { s: 1, f: 3 }, ';': { s: 1, f: 4 },
  'n': { s: 0, f: 0 }, 'm': { s: 0, f: 1 }, ',': { s: 0, f: 2 }, '.': { s: 0, f: 3 }, '/': { s: 0, f: 4 },
};

/**
 * 7. 静态指法建议 (未来功能预留)
 * 定义常用和弦形状的相对指法
 * finger: 1-食指, 2-中指, 3-无名指, 4-小指
 */
export const FINGER_SUGGESTIONS = {
  'powerChord': [
    { relativeS: 0, relativeF: 0, finger: 1 }, // Root
    { relativeS: -1, relativeF: 2, finger: 3 }, // 5th
    { relativeS: -2, relativeF: 2, finger: 4 }  // Octave
  ]
};