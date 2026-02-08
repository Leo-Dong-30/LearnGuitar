
# 🎸 Guitar Lab - 交互式吉他乐理实验室

**Guitar Lab** 是一款专为吉他手设计的网页端交互式乐理学习与练习工具。通过物理建模指板、实时频率识别以及动态乐理推论引擎，帮助用户在指板上直观地探索音阶、和弦与听音技巧。

## ✨ 核心特性

* **智能指板可视化** ：动态渲染 15 品吉他指板，支持 12 平均律下的音阶与和弦全位置映射。
* **乐理推导引擎** ：基于根音自动推算 Major、Minor、Pentatonic 等多种音阶，并实时标注音程级数（Root, 3rd, 5th 等）。
* **实时音高检测** ：通过 Web Audio API 与自相关算法（Autocorrelation），支持麦克风实时识别吉他弹奏并映射到指板位置。
* **交互式练习系统** ：
* **盲听练习** ：系统随机出题播放音讯，用户在指板上寻找正确位置，建立听觉与物理位置的联系。
* **练习统计** ：实时追踪练习正确率与得分。
* **高精度节拍器** ：采用预调度算法（Lookahead Scheduling），确保在浏览器环境中依然拥有稳定的节奏性能。
* **多模式交互** ：支持鼠标点击探索、电脑键盘映射弹奏以及真实的麦克风输入。

## 🛠️ 技术架构

本项采用现代前端技术栈构建，核心逻辑高度解耦：

* **框架** ：React + Tailwind CSS（提供响应式且具有磨砂质感的 UI）。
* **音频底层** ：Web Audio API（用于声音合成与信号分析）。
* **核心引擎** ：
* `AudioEngine`：负责三角波音色合成及基频提取算法。
* `TheoryEngine`：负责半音偏移计算与音程映射。
* `MetronomeEngine`：负责硬件时钟同步的节奏控制。
* `ExerciseEngine`：管理练习题目的生成逻辑与校验。

## 🚀 快速开始

### 环境要求

* Node.js (建议 v16.0.0+)
* 支持 Web Audio API 的现代浏览器（Chrome, Edge, Safari 等）

### 安装步骤

1. **克隆仓库**
   **Bash**

   ```
   git clone https://github.com/your-username/guitar-lab.git
   cd guitar-lab
   ```
2. **安装依赖**
   **Bash**

   ```
   npm install
   ```
3. **启动开发服务器**
   **Bash**

   ```
   npm run dev
   ```

## 🎹 键盘映射 (Keyboard Map)

在“键盘模式”下，你可以使用电脑按键模拟吉他弹奏：

| **琴弦**           | **对应品位 (0-4 品)**               |
| ------------------------ | ----------------------------------------- |
| **高音弦 (1-3弦)** | `Y U I O P`/`H J K L ;`/`N M , . /` |
| **低音弦 (4-6弦)** | `Q W E R T`/`A S D F G`/`Z X C V B` |

## 📂 项目结构

**Plaintext**

```
src/
├── components/     # UI 组件 (指板、节拍器、导航等)
├── hooks/          # 自定义逻辑封装 (PitchDetection, Metronome等)
├── services/       # 核心计算引擎 (Audio, Theory, Exercise)
├── constants/      # 乐理字典与硬件配置
└── App.jsx         # 应用主入口
```

## 🛡️ 开源协议

本项目基于 MIT 协议开源。

---

**想为项目做贡献？**

欢迎提交 Issue 或 Pull Request 来优化识别算法或增加更多复杂的和弦字典！
