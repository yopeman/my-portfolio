const PROGRESS_PATTERN = /^(.*?)\s*\((\d{1,3})%\)\s*$/;

function mean(values) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

/**
 * Reads the skills markdown that `skillsToMarkdown` produces and returns the
 * structure behind it: category names, entries, counts, and proficiency
 * levels. Pages use this to show a real summary instead of a hardcoded one.
 */
export function summarizeSkills(markdown) {
  const categories = [];
  let current = null;

  for (const line of (markdown || '').split('\n')) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      current = { name: heading[1].trim(), entries: [] };
      categories.push(current);
      continue;
    }

    const item = line.match(/^-\s+(.+)$/);
    if (!item || !current) continue;

    const match = item[1].match(PROGRESS_PATTERN);
    current.entries.push({
      name: match ? match[1].trim() : item[1].trim(),
      level: match ? Number(match[2]) : null,
    });
  }

  const withStats = categories.map((category) => {
    const levels = category.entries.map((entry) => entry.level).filter((value) => value !== null);
    return {
      name: category.name,
      entries: category.entries,
      skills: category.entries.map((entry) => entry.name),
      count: category.entries.length,
      average: mean(levels),
    };
  });

  const allLevels = withStats
    .flatMap((category) => category.entries.map((entry) => entry.level))
    .filter((value) => value !== null);

  return {
    categories: withStats,
    total: withStats.reduce((sum, category) => sum + category.count, 0),
    average: mean(allLevels),
  };
}

export default summarizeSkills;
