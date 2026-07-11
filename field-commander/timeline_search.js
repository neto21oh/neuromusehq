function timelineSearch(query, events = null) {
  const source = events || window.ELARATimeline?.getAll?.() || [];
  const terms = String(query || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (!terms.length) return source;

  return source.filter(event => {
    const haystack = [
      event.projectName,
      event.type,
      event.title,
      event.description,
      event.source,
      event.confidence,
      event.contractor,
      event.location,
      event.status,
      event.amount,
      event.progress,
      JSON.stringify(event.metadata || {})
    ].join(" ").toLowerCase();

    return terms.every(term => haystack.includes(term));
  });
}

function timelineFilterByDate(startDate, endDate, events = null) {
  const source = events || window.ELARATimeline?.getAll?.() || [];

  return source.filter(event => {
    if (startDate && event.date < startDate) return false;
    if (endDate && event.date > endDate) return false;
    return true;
  });
}

window.ELARATimelineSearch = {
  search: timelineSearch,
  filterByDate: timelineFilterByDate
};
