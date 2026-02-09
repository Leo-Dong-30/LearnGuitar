我已收到并解析了 `components/` 目录下的所有核心 UI 组件。至此，整个 **Guitar Lab** 的血肉（视图层）已经与骨架（逻辑层）完全对接。

你的组件设计充分利用了 **Tailwind CSS** 的毛玻璃质感（backdrop-blur）和响应式布局，视觉上非常现代。以下是 UI 层的逻辑记忆要点：

---

### 🖼️ UI 组件层逻辑备忘

#### 1. `Fretboard.jsx` (交互核心)

* **多层渲染渲染架构** ：包含背景（指板纹理）、品丝（Frets）、品位记号点（Inlays）、琴弦（Strings）以及最顶层的交互音符层。
* **视觉状态优先级** ：
* **Active (蓝色发光)** ：代表当前识别或播放的即时音符。
* **Root (橙色边框)** ：在乐理提示模式下突出显示根音。
* **Guide (低调白框)** ：显示音阶/和弦内的辅助音符，并标注音程级数（如 R, 3, 5）。
* **物理细节** ：琴弦粗细根据 `sIdx` 动态调整（低音弦更粗），模拟真实视觉。

#### 2. `IntervalMap.jsx` (音程环)

* **极坐标映射** ：将 12 个半音均匀分布在 **$360^{\circ}$** 圆环上。
* **动态反馈** ：通过 `activeNote` 触发指示球的旋转位移，公式为：`rotate(index * 30deg - 90deg)`。

#### 3. `TheorySelector.jsx` (乐理中枢)

* **联动选择** ：支持根音选择，并根据“音阶”或“和弦”模式动态切换 `select` 下拉列表的内容（基于 `SCALES` 和 `CHORDS` 字典）。

#### 4. `Navigation.jsx` & `PracticeStats.jsx` (控制与反馈)

* **模式切换** ：`Navigation` 负责在“探索”、“识别”、“键盘”和“练习”模式间切换，并实时显示麦克风监听状态。
* **成绩看板** ：`PracticeStats` 实时计算练习准确率，并提供“显示参考点”的开关选项，用于调节盲听练习的难度。

#### 5. `MetronomePanel.jsx` (节奏控制)

* **UI 绑定** ：直接映射 `bpm` 和 `isMetronomePlaying` 状态，并包含一个 **$40\text{--}220\text{BPM}$** 的滑动条。

---

### 🧩 整体架构全景图

目前你的项目已经形成了一个闭环：

1. **输入** ：鼠标点击 (`Fretboard`)、键盘按键 (`KEYBOARD_MAP`) 或 麦克风 (`usePitchDetection`)。
2. **处理** ：由 `theoryEngine` 计算乐理位置，`audioEngine` 负责发声与采样分析。
3. **输出** ：`Fretboard` 的视觉反馈、`IntervalMap` 的频率指示以及 `PracticeStats` 的数据统计。

**所有核心模块已记忆完毕！**

最后只剩下主入口文件  **`App.jsx`** 。它是所有 Hook 和组件汇聚的地方，通常包含了拖拽逻辑（针对 `IntervalMap`）和全局状态管理。

**准备好接收 `App.jsx` 及其余文件了吗？**
