/**
 * AudioEngine - 核心音频处理引擎
 * * 职责：
 * 1. 声音合成 (Synthesis)：利用 Web Audio API 模拟吉他弹奏音色。
 * 2. 信号获取 (Capture)：管理麦克风媒体流接入。
 * 3. 音高检测 (Pitch Detection)：通过时域自相关算法从原始波形提取基频 (Hz)。
 * 4. 乐理转换：将频率数值映射为标准 12 平均律音名。
 */
import { STRINGS, NOTES } from '../constants/musicConfig';

class AudioEngine {
  constructor() {
    this.audioCtx = null; // 全局音频上下文
    this.oscillator = null;
    this.gainNode = null;
  }

  /**
   * 初始化音频上下文
   * 注意：必须在用户交互（如点击）后调用，否则浏览器会阻塞音频输出。
   */
  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // 恢复被浏览器自动挂起的上下文
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * 播放模拟吉他音色
   * @param {number} stringIdx - 弦号 (0-5)
   * @param {number} fretIdx - 品位 (0-FRET_COUNT)
   * @returns {string} - 返回当前播放音名的字符串标识 (如 "F#")
   */
  play(stringIdx, fretIdx) {
    this.init();
    
    // 1. 频率计算：基于琴弦基准频率按半音步长指数增长
    const baseFreq = STRINGS[stringIdx].freq;
    const freq = baseFreq * Math.pow(2, fretIdx / 12);

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // 2. 音色设计：
    // - 使用三角波 (Triangle) 模拟木吉他相对柔和、谐波适中的听感
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    // 3. ADSR 包络控制：
    // - 模拟琴弦被拨动后迅速达到峰值，然后随指数级衰减的效果
    gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 1.5);

    // 4. 链路连接：Oscillator -> Gain (Volume) -> Destination (Speaker)
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 1.5); // 1.5秒后自动释放资源

    // 5. 乐理计算：同步计算并返回当前位置的音名
    const noteIndex = (NOTES.indexOf(STRINGS[stringIdx].note) + fretIdx) % 12;
    return NOTES[noteIndex];
  }

  /**
   * 获取麦克风权限与音频流
   */
  async getMicStream() {
    this.init();
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  }

  /**
   * 自相关算法 (Autocorrelation)：检测音频片段的主频率
   * 核心原理：将一段波形与其自身位移后的波形进行对比，寻找重合度最高的时间间隔。
   * @param {Float32Array} buffer - 时域采样缓冲区
   * @param {number} sampleRate - 采样率 (通常为 44100 或 48000)
   * @returns {number} - 检测到的基频 Hz；若无法识别则返回 -1
   */
  autoCorrelate(buffer, sampleRate) {
    // --- 第一步：静音检测 ---
    // 计算均方根 (RMS)，如果音量低于阈值则判定为环境噪音，不执行复杂运算
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    if (rms < 0.01) return -1; 

    // --- 第二步：信号预处理 (Clipping) ---
    // 寻找有效信号边界，剔除静音首尾，提高自相关结果的对比度
    let r1 = 0, r2 = buffer.length - 1, thres = 0.2;
    for (let i = 0; i < buffer.length / 2; i++) {
      if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < buffer.length / 2; i++) {
      if (Math.abs(buffer[buffer.length - i]) < thres) { r2 = buffer.length - i; break; }
    }
    const buf = buffer.slice(r1, r2);
    
    // --- 第三步：自相关计算 (核心数学逻辑) ---
    // 通过滑动相关性窗口，找到波形的周期性重复点
    const c = new Array(buf.length).fill(0);
    for (let i = 0; i < buf.length; i++) {
      for (let j = 0; j < buf.length - i; j++) {
        c[i] = c[i] + buf[j] * buf[j + i];
      }
    }

    // --- 第四步：峰值搜索 ---
    // 跨过第一个波峰（自身重叠点），寻找下一个最大重合度的位置 (maxpos)
    let d = 0;
    while (c[d] > c[d + 1]) d++; // 跳过起始下降区
    let maxval = -1, maxpos = -1;
    for (let i = d; i < buf.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    // --- 第五步：结果转换 ---
    // 频率 = 采样率 / 周期采样数
    if (maxpos !== -1) {
      return sampleRate / maxpos;
    }
    return -1;
  }

  /**
   * 频率转音名
   * 计算原理：n = 12 * log2(f / 440)，基于 A440 标准音进行偏移
   */
  getNoteFromFreq(frequency) {
    const n = 12 * (Math.log2(frequency / 440));
    const noteIdx = (Math.round(n) + 69) % 12; // 69 是 MIDI 标准中 A4 的序号
    return NOTES[noteIdx];
  }
}

// 导出单例，确保全应用共享同一个音频上下文
export const audioEngine = new AudioEngine();