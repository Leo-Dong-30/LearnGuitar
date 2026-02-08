/**
 * MetronomeEngine - 极简高精度节拍器引擎
 * * 职责：
 * 1. 解决定时误差：通过 Web Audio API 的硬件时钟补偿 JavaScript 定时器的毫秒级漂移。
 * 2. 预调度系统：利用“提前量”算法，确保即使在主线程繁忙时也能维持稳定的节奏。
 * 3. 强弱拍控制：通过频率切换区分小节首拍。
 */
class MetronomeEngine {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;      // 共享外部 AudioContext
    this.isActive = false;         // 运行状态标识
    this.bpm = 120;                // 当前速度
    
    // --- 核心调度变量 ---
    this.nextNoteTime = 0.0;       // 下一拍发生的绝对硬件时间 (单位: 秒)
    this.timerID = null;           // setTimeout 引用，用于循环自调用
    this.lookahead = 25.0;         // 检查周期 (ms)：每 25 毫秒检查一次是否需要排队播放新音讯
    this.scheduleAheadTime = 0.1;  // 预调度时间 (s)：始终提前 100 毫秒向硬件推送音频指令
    
    this.beat = 0;                 // 计数器：记录当前是第几拍
    this.beatsPerMeasure = 4;      // 小节拍数（如 4/4 拍）
  }

  /**
   * 物理发声：在指定的硬件精确时间点排队播放一个“滴答”声
   * @param {number} beatNumber - 当前拍序，用于判断是否为首拍
   * @param {number} time - Web Audio 硬件时钟的精确触发时间
   */
  scheduleNote(beatNumber, time) {
    const osc = this.audioCtx.createOscillator();
    const envelope = this.audioCtx.createGain();

    // 1. 频率区分：小节第一拍使用 1000Hz (更尖锐)，其余使用 800Hz
    osc.frequency.value = beatNumber % this.beatsPerMeasure === 0 ? 1000 : 800;
    
    // 2. 音量包络：极短的线性衰减，防止产生爆音 (Pop Sound)
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(envelope);
    envelope.connect(this.audioCtx.destination);

    // 3. 硬件排队：即便 JS 线程卡顿，AudioContext 也会准时在 time 触发
    osc.start(time);
    osc.stop(time + 0.1);
  }

  /**
   * 调度器轮询：持续检查并填充预调度窗口
   * 算法说明：
   * 当“下一拍时间”落入“当前时间 + 提前量”的窗口内时，就将该拍推送给硬件。
   */
  scheduler() {
    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.beat, this.nextNoteTime);
      this.nextNote();
    }
    // 递归轮询
    this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
  }

  /**
   * 时间步进：计算下一拍发生的时刻
   */
  nextNote() {
    const secondsPerBeat = 60.0 / this.bpm; // 将 BPM 转换为秒
    this.nextNoteTime += secondsPerBeat;    // 累加时间
    this.beat++;                            // 拍子递增
  }

  /**
   * 启动引擎
   * @param {number} bpm - 初始速度
   */
  start(bpm) {
    if (this.isActive) return;
    this.isActive = true;
    this.bpm = bpm;
    this.beat = 0;
    // 稍微延迟 50ms 启动，留出系统响应缓冲
    this.nextNoteTime = this.audioCtx.currentTime + 0.05;
    this.scheduler();
  }

  /**
   * 停止引擎并清理定时器
   */
  stop() {
    this.isActive = false;
    clearTimeout(this.timerID);
  }
}

// 导出单例
export const metronomeEngine = new MetronomeEngine();