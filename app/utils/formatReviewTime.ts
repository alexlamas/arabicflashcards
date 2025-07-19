export function formatTimeUntilReview(nextReviewDate: string | undefined | null): string | null {
  if (!nextReviewDate) return null;

  const now = new Date();
  const reviewDate = new Date(nextReviewDate);
  
  // Handle invalid dates
  if (isNaN(reviewDate.getTime())) return null;
  
  const diffMs = reviewDate.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  // Past due
  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 1) return "Yesterday";
    if (absDays < 7) return `${absDays} days ago`;
    if (absDays < 30) {
      const weeks = Math.floor(absDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    }
    if (absDays < 365) {
      const months = Math.floor(absDays / 30);
      return months === 1 ? "1 month ago" : `${months} months ago`;
    }
    const years = Math.floor(absDays / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
  
  // Today
  if (diffDays === 0) return "Today";
  
  // Tomorrow
  if (diffDays === 1) return "Tomorrow";
  
  // Within a week
  if (diffDays < 7) return `${diffDays} days`;
  
  // Within a month
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    if (weeks === 1) return "Next week";
    return `${weeks} weeks`;
  }
  
  // Within a year
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    if (months === 1) return "Next month";
    return `${months} months`;
  }
  
  // More than a year
  const years = Math.floor(diffDays / 365);
  if (years === 1) return "Next year";
  return `${years} years`;
}