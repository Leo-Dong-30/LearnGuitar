/**
 * ExerciseEngine - 练习逻辑引擎
 * * 职责：
 * 1. 题目生成器：根据当前的乐理环境（音阶/和弦）或全指板范围随机出题。
 * 2. 状态追踪：暂存当前待解答的题目坐标。
 * 3. 结果校验：比对用户点击的物理坐标 (弦/品) 与目标坐标。
 */
import { NOTES, STRINGS } from '../constants/musicConfig';

class ExerciseEngine {
  constructor() {
    this.currentQuestion = null; // 存储当前题目坐标 { sIdx, fIdx }
  }

  /**
   * 生成新的练习题目
   * * 核心逻辑：
   * 1. 智能联动：如果 `guidePositions` 不为空，说明用户开启了特定的音阶/和弦提示。
   * 引擎将自动进入“针对性训练模式”，仅在选定的乐理范围内出题。
   * 2. 全域随机：如果没有任何提示，引擎进入“全指板挑战模式”，范围限制在 0-12 品。
   * * @param {Array} guidePositions - 当前指板高亮位置列表 [{s, f, ...}, ...]
   * @returns {Object} - 生成的题目坐标 { sIdx, fIdx }
   */
  generateQuestion(guidePositions = []) {
    let target;

    // A. 针对性练习逻辑：从当前选定的音阶/和弦节点中随机抽取
    if (guidePositions && guidePositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * guidePositions.length);
      const pos = guidePositions[randomIndex];
      target = { sIdx: pos.s, fIdx: pos.f };
    } 
    // B. 全指板练习逻辑：全六弦，前 12 品范围随机
    else {
      target = {
        sIdx: Math.floor(Math.random() * 6),
        fIdx: Math.floor(Math.random() * 13) // 包含琴枕 0 品
      };
    }
    
    this.currentQuestion = target;
    return this.currentQuestion;
  }

  /**
   * 结果校验：支持“同音异位”判定
   * @param {number} userSIdx - 用户点击的弦
   * @param {number} userFIdx - 用户点击的品
   * @param {Array} stringsConfig - 注入 STRINGS 配置以计算音名
   * @param {Array} notesConfig - 注入 NOTES 配置
   * @returns {boolean}
   */
  checkAnswer(userSIdx, userFIdx, stringsConfig, notesConfig) {
    if (!this.currentQuestion) return false;

    const target = this.currentQuestion;

    // 1. 获取目标位置的音名索引
    // 计算公式：(起始弦音索引 + 品位) % 12
    const targetStartNoteIdx = notesConfig.indexOf(stringsConfig[target.sIdx].note);
    const targetNoteIdx = (targetStartNoteIdx + target.fIdx) % 12;

    // 2. 获取用户点击位置的音名索引
    const userStartNoteIdx = notesConfig.indexOf(stringsConfig[userSIdx].note);
    const userNoteIdx = (userStartNoteIdx + userFIdx) % 12;

    // 3. 核心判定：只要音名相同（12平均律中的位置相同），即视为正确
    return targetNoteIdx === userNoteIdx;
  }
}

// 导出单例，确保全应用练习状态同步
export const exerciseEngine = new ExerciseEngine();