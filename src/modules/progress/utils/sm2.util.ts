export interface SM2Input {
  quality: number;    // 0-5
  ease_factor: number;
  interval: number;
  streak: number;
}

export interface SM2Result {
  ease_factor: number;
  interval: number;
  streak: number;
  status: 'learning' | 'known';
  next_review: Date;
}

export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, ease_factor, interval, streak } = input;

  let newInterval: number;
  let newEaseFactor: number;
  let newStreak: number;

  if (quality >= 3) {
    // Trả lời đúng
    if (interval === 0) {
      // Lần đầu học — luôn ôn lại sau 1 ngày
      newInterval = 1;
    } else {
      newInterval = Math.round(interval * ease_factor);
    }

    // Cập nhật ease_factor theo chất lượng trả lời
    newEaseFactor = ease_factor + 0.1 - (5 - quality) * 0.08;
    newEaseFactor = Math.max(1.3, newEaseFactor); // không để xuống dưới 1.3
    newStreak = streak + 1;
  } else {
    // Trả lời sai — reset interval về 1 ngày
    newInterval = 1;
    newEaseFactor = Math.max(1.3, ease_factor - 0.2);
    newStreak = 0;
  }

  // Tính next_review = hôm nay + interval ngày
  const next_review = new Date();
  next_review.setDate(next_review.getDate() + newInterval);
  next_review.setHours(0, 0, 0, 0); // reset về đầu ngày

  // interval >= 21 ngày thì coi như đã thuộc
  const status = newInterval >= 21 ? 'known' : 'learning';

  return {
    ease_factor: Math.round(newEaseFactor * 100) / 100, // làm tròn 2 chữ số
    interval: newInterval,
    streak: newStreak,
    status,
    next_review,
  };
}