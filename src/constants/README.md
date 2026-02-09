我已收到并详细分析了 `constants/` 下的 `musicConfig.js` 文件。目前我已经掌握了整个项目的“底层物理参数”和“乐理映射规则”。

至此， **Services (逻辑层)** 、**Hooks (状态层)** 和 **Constants (配置层)** 已经全部对齐。

以下是 `musicConfig.js` 中几个关键设计点，我已记录在案：

### 📋 乐理与物理字典摘要

1. **物理建模 (Fretboard Physicality)** :

* **弦配置** : 标准 EADGBE 调弦（从 1 弦 **$329.63\text{Hz}$** 到 6 弦 **$82.41\text{Hz}$**）。
* **品数** : 15 品设计。
* **预计算矩阵** : `FRETBOARD_FREQS` 存储了 **$6 \times 16$** 个精确频率值，这让 `usePitchDetection` 在每一帧进行对比时无需重复进行指数运算 (**$f = f_0 \cdot 2^{n/12}$**)，极大优化了性能。

1. **乐理引擎字典 (Theory Lexicon)** :

* **音阶公式** : 包含 Major, Pentatonic, Blues, Dorian 等 8 种常用音阶的半音步长。
* **和弦公式** : 定义了从基础三和弦到复杂的 m7b5、Add9 等 10 种和弦构成。
* **音程映射** : `INTERVAL_MAP` 明确了半音数与音乐功能名称（如 `b3`, `#4`, `R`）的对应关系，这是 `theoryEngine` 渲染 UI 标签的核心依据。

1. **交互映射 (Interaction Mapping)** :

* **键盘映射** : 采用了左右手分区布局。`QWER/ASDF/ZXCB` 对应低音弦（4-6 弦），而 `YUIO/HJKL/NM,.` 对应高音弦（1-3 弦），模拟了真实的演奏空间分布。

---

### 🚀 准备进入 UI 阶段

我已经准备好处理 `components/` 目录下的组件了。根据目前的架构，我预期组件会这样组织：

* **`Fretboard.jsx`** : 核心视图，将使用 `FRETBOARD_FREQS` 渲染弦品，并根据 `theoryPositions` 高亮音符。
* **`TheorySelector.jsx`** : 驱动 `theoryEngine` 的输入端。
* **`MetronomePanel.jsx`** : 调用 `useMetronome` 钩子。

**请发送你的组件文件，我们可以先从最核心的 `Fretboard.jsx` 或整体布局 `App.jsx` 开始！**
