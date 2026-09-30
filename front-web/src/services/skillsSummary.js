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

/**
 * Truncates the skills markdown to the first `limit` entries so a summary
 * section can show a handful of badges and leave the rest to the full page.
 * Headings left without any entries are dropped.
 */
export function previewSkills(markdown, limit) {
  const source = markdown || '';
  const total = summarizeSkills(source).total;

  if (!limit || limit < 1 || total <= limit) {
    return { markdown: source, shown: total, hidden: 0 };
  }

  const groups = [];
  for (const line of source.split('\n')) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      groups.push({ heading: heading[2].trim(), level: heading[1].length, items: [] });
      continue;
    }
    const item = line.match(/^(\s*)-\s+(.+)$/);
    if (!item) continue;
    if (groups.length === 0) groups.push({ heading: null, level: 2, items: [] });
    groups[groups.length - 1].items.push({ indent: item[1], text: item[2] });
  }

  const kept = [];
  let shown = 0;

  for (const group of groups) {
    if (shown >= limit) break;
    const items = group.items.slice(0, limit - shown);
    if (items.length === 0) continue;
    shown += items.length;
    kept.push(
      group.heading ? `${'#'.repeat(group.level)} ${group.heading}` : null,
      ...items.map((item) => `${item.indent}- ${item.text}`),
    );
  }

  return { markdown: kept.filter(Boolean).join('\n'), shown, hidden: total - shown };
}

export default summarizeSkills;
