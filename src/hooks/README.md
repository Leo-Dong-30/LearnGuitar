我已同步 `hooks/` 目录下的三个自定义 Hook。这些 Hook 充当了“胶水层”，将之前定义的底层引擎（Services）与即将出现的 UI 组件（Components）有机结合。

以下是 Hook 层的逻辑记忆要点：

---

### 🪝 Hook 层逻辑备忘

#### 1. `useGuitarActions.js` (业务状态机)

* **职责** ：管理“探索模式”与“练习模式”的切换。
* **反馈机制** ：通过 `lastFeedback`（'correct' | 'wrong'）驱动 UI 的瞬时反馈。
* **自动化流程** ：在练习模式下，`playNote` 不仅负责发声，还会通过 `exerciseEngine` 校验对错，并设定 **1.5秒** 的定时器自动通过 `nextQuestion` 切换下一题。

#### 2. `usePitchDetection.js` (实时音频交互)

* **采样策略** ：利用 `requestAnimationFrame` 维持约 **60fps** 的高频采样循环。
* **物理映射优化** ：
* **频率过滤** ：仅处理 **$60\text{Hz}$** 至 **$1200\text{Hz}$** 之间的有效吉他音域频率。
* **容差匹配** ：对比 `FRETBOARD_FREQS` 矩阵时，允许 **3%** 的频率误差（约半个半音），以兼容吉他音准微调或按弦力度导致的频率偏移。
* **资源管理** ：严格管理麦克风流（MediaStream）的开启与关闭，防止组件卸载后硬件占用或内存泄漏。

#### 3. `useMetronome.js` (节奏同步)

* **交互策略** ：封装了浏览器安全限制处理，在 `toggleMetronome` 时触发 `audioEngine.init()` 以激活 AudioContext。
* **属性同步** ：支持在节拍器运行过程中动态修改 `bpm`，并实时反映到底层引擎。

---

### 🎨 交互流程预览

为了方便后续组件开发，我为你梳理了**盲听练习**的完整逻辑链：

1. **启动** ：用户触发 `startEarTraining`。
2. **出题** ：`exerciseEngine` 根据当前 `theoryPositions`（如 C 大调音阶）选点。
3. **播音** ：延迟 0.5s 播放目标音。
4. **校验** ：用户点击指板触发 `playNote`，Hook 比对物理坐标并更新 `exerciseScore`。
5. **循环** ：1.5s 后自动调用 `nextQuestion` 进入下一轮。

**Hook 层已对接完毕。接下来请发送 `constants/` 或具体的 `components/` 代码，我们将进入 UI 实现阶段！**
