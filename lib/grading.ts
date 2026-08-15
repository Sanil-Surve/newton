export function calculateGrade(marks: number, total: number = 100) {
  const pct = (marks / total) * 100
  if (pct >= 90) return { point: 4.0, letter: "A+" }
  if (pct >= 85) return { point: 3.8, letter: "A" }
  if (pct >= 80) return { point: 3.5, letter: "A-" }
  if (pct >= 75) return { point: 3.2, letter: "B+" }
  if (pct >= 70) return { point: 3.0, letter: "B" }
  if (pct >= 65) return { point: 2.7, letter: "B-" }
  if (pct >= 60) return { point: 2.3, letter: "C+" }
  if (pct >= 50) return { point: 2.0, letter: "C" }
  return { point: 0.0, letter: "F" }
}
