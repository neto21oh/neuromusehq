function timelineGroupByType(events) {
  return events.reduce((groups, event) => {
    const key = event.type || "General Update";
    groups[key] = groups[key] || [];
    groups[key].push(event);
    return groups;
  }, {});
}

function timelineDailySummary(date, events = null) {
  const source = events || window.ELARATimeline?.getAll?.() || [];
  const dayEvents = source
    .filter(event => event.date === date)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const groups = timelineGroupByType(dayEvents);

  const lines = [
    "ELARA DAILY PROJECT SUMMARY",
    "",
    `Date: ${date}`,
    `Recorded Events: ${dayEvents.length}`,
    ""
  ];

  Object.entries(groups).forEach(([type, items]) => {
    lines.push(type.toUpperCase());
    items.forEach(item => {
      lines.push(`- ${item.time} | ${item.title}${item.description ? ` — ${item.description}` : ""}`);
    });
    lines.push("");
  });

  if (!dayEvents.length) {
    lines.push("No project activity was recorded for this date.");
  }

  return {
    date,
    count: dayEvents.length,
    events: dayEvents,
    text: lines.join("\n")
  };
}

function timelineWeeklySummary(startDate, endDate, events = null) {
  const source = events || window.ELARATimeline?.getAll?.() || [];
  const weekEvents = source.filter(event =>
    event.date >= startDate && event.date <= endDate
  );

  const typeCounts = weekEvents.reduce((counts, event) => {
    counts[event.type] = (counts[event.type] || 0) + 1;
    return counts;
  }, {});

  const lines = [
    "ELARA WEEKLY PROJECT SUMMARY",
    "",
    `Period: ${startDate} through ${endDate}`,
    `Recorded Events: ${weekEvents.length}`,
    "",
    "ACTIVITY COUNTS"
  ];

  Object.entries(typeCounts).forEach(([type, count]) => {
    lines.push(`- ${type}: ${count}`);
  });

  return {
    startDate,
    endDate,
    count: weekEvents.length,
    events: weekEvents,
    typeCounts,
    text: lines.join("\n")
  };
}

window.ELARATimelineSummary = {
  daily: timelineDailySummary,
  weekly: timelineWeeklySummary
};
