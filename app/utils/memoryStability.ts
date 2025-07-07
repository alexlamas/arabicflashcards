// Constants for memory stability calculation
const STABILITY_WEIGHTS = {
  INTERVAL: 0.5,
  SUCCESS_RATE: 0.3,
  REVIEW_COUNT: 0.1,
  EASE_FACTOR: 0.1,
} as const;

const STABILITY_THRESHOLDS = {
  JUST_STARTED: 20,
  BUILDING: 40,
  DEVELOPING: 60,
  STRONG: 80,
} as const;

const INTERVAL_SCALING = {
  BASE_SCORE: 20,
  LOG_BASE: 2,
  MAX_SCORE: 95,
} as const;

const REVIEW_BONUS = {
  MAX: 10,
  PER_REVIEW: 2,
} as const;

const EASE_FACTOR_RANGE = {
  MIN: 1.3,
  MAX: 2.5,
  SCALE: 20,
} as const;

export interface StabilityLevel {
  level: "just_started" | "building" | "developing" | "strong" | "mastered";
  description: string;
  colorClass: {
    bg: string;
    text: string;
    progress: string;
  };
}

export function getStabilityLevel(score: number): StabilityLevel {
  if (score < STABILITY_THRESHOLDS.JUST_STARTED) {
    return {
      level: "just_started",
      description: "Just starting - review frequently",
      colorClass: {
        bg: "bg-red-100",
        text: "text-red-600",
        progress: "text-red-400",
      },
    };
  }
  if (score < STABILITY_THRESHOLDS.BUILDING) {
    return {
      level: "building",
      description: "Building memory - keep practicing",
      colorClass: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        progress: "text-orange-400",
      },
    };
  }
  if (score < STABILITY_THRESHOLDS.DEVELOPING) {
    return {
      level: "developing",
      description: "Developing well - good progress",
      colorClass: {
        bg: "bg-yellow-100",
        text: "text-yellow-600",
        progress: "text-yellow-400",
      },
    };
  }
  if (score < STABILITY_THRESHOLDS.STRONG) {
    return {
      level: "strong",
      description: "Strong retention - nearly mastered",
      colorClass: {
        bg: "bg-green-100",
        text: "text-green-600",
        progress: "text-green-400",
      },
    };
  }
  return {
    level: "mastered",
    description: "Excellent! Well memorized",
    colorClass: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      progress: "text-emerald-400",
    },
  };
}

export function calculateMemoryStability(params: {
  interval: number;
  successRate?: number;
  reviewCount?: number;
  easeFactor?: number;
}): number {
  const {
    interval = 0,
    successRate = 0,
    reviewCount = 0,
    easeFactor = 2.5,
  } = params;

  // Validate inputs
  const validInterval = Math.max(0, interval);
  const validSuccessRate = Math.max(0, Math.min(1, successRate));
  const validReviewCount = Math.max(0, reviewCount);
  const validEaseFactor = Math.max(
    EASE_FACTOR_RANGE.MIN,
    Math.min(EASE_FACTOR_RANGE.MAX, easeFactor)
  );

  // Calculate interval score using logarithmic scale
  const intervalScore =
    validInterval === 0
      ? 0
      : Math.min(
          INTERVAL_SCALING.MAX_SCORE,
          INTERVAL_SCALING.BASE_SCORE *
            Math.log2(validInterval + 1) / Math.log2(INTERVAL_SCALING.LOG_BASE)
        );

  // Calculate review frequency bonus
  const reviewBonus = Math.min(
    REVIEW_BONUS.MAX,
    validReviewCount * REVIEW_BONUS.PER_REVIEW
  );

  // Calculate ease factor contribution
  const easeRange = EASE_FACTOR_RANGE.MAX - EASE_FACTOR_RANGE.MIN;
  const easeScore =
    ((validEaseFactor - EASE_FACTOR_RANGE.MIN) / easeRange) *
    EASE_FACTOR_RANGE.SCALE;

  // Weighted combination
  const stability =
    intervalScore * STABILITY_WEIGHTS.INTERVAL +
    validSuccessRate * 100 * STABILITY_WEIGHTS.SUCCESS_RATE +
    reviewBonus * STABILITY_WEIGHTS.REVIEW_COUNT +
    easeScore * STABILITY_WEIGHTS.EASE_FACTOR;

  return Math.round(Math.min(100, Math.max(0, stability)));
}

export function calculateSuccessRate(
  currentSuccessRate: number | null | undefined,
  reviewCount: number,
  isSuccess: boolean
): number {
  // For first review
  if (reviewCount === 0) {
    return isSuccess ? 1 : 0;
  }

  // Validate current success rate
  const validCurrentRate = currentSuccessRate ?? 0;
  
  // Calculate rolling average
  const totalReviews = reviewCount + 1;
  const successCount = validCurrentRate * reviewCount + (isSuccess ? 1 : 0);
  
  return Math.min(1, Math.max(0, successCount / totalReviews));
}