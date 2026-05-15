/**
 * UI表示で使う日本語テキストのヘルパー。
 * - アクション種別 / グレード / 解説文を生成する。
 */

import type { ActionChoice, ActionEvaluation } from "./types";
import { BIG_BLIND } from "./types";

/** アクション種別 -> 日本語名 */
export function actionKindJp(kind: ActionChoice["kind"]): string {
  switch (kind) {
    case "fold":
      return "フォールド";
    case "check":
      return "チェック";
    case "call":
      return "コール";
    case "bet":
      return "ベット";
    case "raise":
      return "レイズ";
    case "allin":
      return "オールイン";
  }
}

/** アクション choice -> 日本語表記 (サイズ込み) */
export function actionLabelJp(choice: ActionChoice): string {
  const name = actionKindJp(choice.kind);
  if (choice.kind === "fold" || choice.kind === "check") return name;
  return `${name} ${(choice.amount / BIG_BLIND).toFixed(1)}BB`;
}

/** グレードラベル */
export function gradeJpLabel(grade: ActionEvaluation["grade"]): string {
  switch (grade) {
    case "great":
      return "完璧！";
    case "good":
      return "良い判断";
    case "ok":
      return "悪くない";
    case "bad":
      return "もったいない";
    case "terrible":
      return "大きなミス";
  }
}

/** グレードに対する一言コメント */
export function gradeJpComment(grade: ActionEvaluation["grade"]): string {
  switch (grade) {
    case "great":
      return "理論上ベストに近い選択です。";
    case "good":
      return "ベストアクションに近く、ほぼEVを取りこぼしていません。";
    case "ok":
      return "許容範囲ですが、より良い選択がありました。";
    case "bad":
      return "EVをそこそこ失っています。次は別の選択を検討しましょう。";
    case "terrible":
      return "EVを大きく落としています。繰り返すと負け額がかさみます。";
  }
}

/**
 * 行ったアクションが「なぜ良い/悪いか」を、勝率・pot odds・MDFなどから
 * 平易な日本語で説明する。
 */
export function buildExplanation(ev: ActionEvaluation): string[] {
  const lines: string[] = [];
  const eq = ev.heroEquity;
  const eqPct = `${(eq * 100).toFixed(1)}%`;

  // 状況サマリ
  lines.push(
    `相手のレンジ（${ev.villainRangeSize}通り）に対するあなたの勝率は ${eqPct} です。`,
  );

  if (ev.toCall > 0) {
    const oddsPct = (ev.potOdds * 100).toFixed(1);
    if (eq >= ev.potOdds) {
      lines.push(
        `コールに必要な勝率は ${oddsPct}% で、あなたの勝率がそれを上回っているのでコールは +EV です。`,
      );
    } else {
      lines.push(
        `コールに必要な勝率は ${oddsPct}% で、あなたの勝率はそれに足りないため基本はフォールドが妥当です。`,
      );
    }
  }

  // 選んだアクション別
  switch (ev.choice.kind) {
    case "fold":
      if (ev.toCall === 0) {
        lines.push(
          "チェックで無料で見られる場面でフォールドしているため、勝てるシェアを放棄しています。",
        );
      } else if (eq >= ev.potOdds) {
        lines.push(
          "コールが +EV なのにフォールドしているため、EVを取りこぼしています。",
        );
      } else {
        lines.push(
          "コール条件を満たさないハンドなのでフォールドは無難な選択です。",
        );
      }
      break;
    case "check":
      lines.push(
        "チェックで次のストリートを安く確認しています。リスクなく勝率を活かす選択肢です。",
      );
      break;
    case "call":
      lines.push(
        eq >= ev.potOdds
          ? "勝率が必要勝率を超えているのでコールは正当化されます。"
          : "必要勝率に届いていないコールはマイナスEVになりやすいです。",
      );
      break;
    case "bet":
    case "raise":
    case "allin": {
      // 該当する meta を allCandidates から検索
      const own = ev.allCandidates.find(
        (c) =>
          c.choice.kind === ev.choice.kind &&
          c.choice.amount === ev.choice.amount,
      );
      const meta = own?.meta;
      if (meta) {
        const foldPct = `${((meta.foldFraction ?? 0) * 100).toFixed(0)}%`;
        const eCallPct = `${((meta.heroEquityVsCalled ?? 0) * 100).toFixed(0)}%`;
        lines.push(
          `このサイズだと相手の約 ${foldPct} がフォールドし、コールしてきた相手に対するあなたの勝率は ${eCallPct} になります。`,
        );
        if ((meta.heroEquityVsCalled ?? 0) < 0.4) {
          lines.push(
            "コールされた時の勝率が低いので、大きなベットは長期的にはマイナスEVになりがちです。",
          );
        }
      }
      break;
    }
  }

  // 最適アクションが違う場合は提案
  if (
    ev.bestChoice.kind !== ev.choice.kind ||
    ev.bestChoice.amount !== ev.choice.amount
  ) {
    lines.push(
      `理論上の最善は「${actionLabelJp(ev.bestChoice)}」で、EV差は ${(ev.evLoss / BIG_BLIND).toFixed(2)}BB です。`,
    );
  } else {
    lines.push("理論上の最善アクションと一致しています。");
  }

  return lines;
}
