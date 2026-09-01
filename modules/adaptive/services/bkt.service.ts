/**
 * Bayesian Knowledge Tracing — updates mastery probability
 * based on observed correct/incorrect answers.
 *
 * Handles the P(T) = 0 edge case: when mastery is 0 and the
 * student answers correctly, apply a first-attempt bonus so BKT can
 * actually produce non-zero values.
 */
const FIRST_ATTEMPT_MASTERY = 0.25;
const DEFAULT_GUESS_RATE = 0.25;
const DEFAULT_SLIP_RATE = 0.10;

export interface BktParams {
  guessRate?: number;
  slipRate?: number;
}

export class BktService {
  private guessRate: number;
  private slipRate: number;

  constructor(params?: BktParams) {
    this.guessRate = params?.guessRate ?? DEFAULT_GUESS_RATE;
    this.slipRate = params?.slipRate ?? DEFAULT_SLIP_RATE;
  }

  updateMastery(currentMastery: number, isCorrect: boolean, isMcq: boolean): number {
    // Edge case: P(T) = 0 and correct → apply first-attempt bonus
    if (currentMastery === 0 && isCorrect) {
      const guessRate = isMcq ? this.guessRate : 0.0;
      const numerator = FIRST_ATTEMPT_MASTERY * (1 - this.slipRate);
      const denominator =
        numerator + (1 - FIRST_ATTEMPT_MASTERY) * guessRate;
      return Math.min(1.0, numerator / Math.max(denominator, 0.001));
    }

    const guessRate = isMcq ? this.guessRate : 0.0;

    let newMastery: number;

    if (isCorrect) {
      const numerator = currentMastery * (1 - this.slipRate);
      const denominator = numerator + (1 - currentMastery) * guessRate;
      newMastery = numerator / Math.max(denominator, 0.001);
    } else {
      const numerator = currentMastery * this.slipRate;
      const denominator =
        numerator + (1 - currentMastery) * (1 - guessRate);
      newMastery = numerator / Math.max(denominator, 0.001);
    }

    return Math.max(0.0, Math.min(1.0, newMastery));
  }

  getMasteryLabel(mastery: number): string {
    if (mastery >= 0.9) return "Mastered";
    if (mastery >= 0.7) return "Proficient";
    if (mastery >= 0.4) return "Learning";
    if (mastery > 0) return "Started";
    return "Not Started";
  }

  static get maxRecentAnswers(): number {
    return 15;
  }
}

export const bktService = new BktService();
export default bktService;