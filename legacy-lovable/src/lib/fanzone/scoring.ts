/** Points: 100 per correct answer + time bonus of 1 point per second remaining (only if at least one correct). */
export function computePoints(correct: number, secondsLeft: number) {
  if (correct <= 0) return 0;
  return correct * 100 + Math.max(0, Math.floor(secondsLeft));
}
export function accuracy(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}
export function rating(acc: number) {
  if (acc >= 90) return "World Class";
  if (acc >= 70) return "Starting XI";
  if (acc >= 50) return "Squad Player";
  return "Academy Prospect";
}
