function timelineDownload(filename, content, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function timelineExportJSON(events = null) {
  const source = events || window.ELARATimeline?.getAll?.() || [];
  timelineDownload(
    "elara-timeline-export.json",
    JSON.stringify(source, null, 2),
    "application/json"
  );
}

function timelineEscapeCSV(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function timelineExportCSV(events = null) {
  const source = events || window.ELARATimeline?.getAll?.() || [];

  const headers = [
    "Date",
    "Time",
    "Project",
    "Type",
    "Title",
    "Description",
    "Contractor",
    "Location",
    "Amount",
    "Progress",
    "Status",
    "Source",
    "Confidence"
  ];

  const rows = source.map(event => [
    event.date,
    event.time,
    event.projectName,
    event.type,
    event.title,
    event.description,
    event.contractor,
    event.location,
    event.amount,
    event.progress ?? "",
    event.status,
    event.source,
    event.confidence
  ]);

  const csv = [
    headers.map(timelineEscapeCSV).join(","),
    ...rows.map(row => row.map(timelineEscapeCSV).join(","))
  ].join("\n");

  timelineDownload("elara-timeline-export.csv", csv, "text/csv");
}

window.ELARATimelineExport = {
  json: timelineExportJSON,
  csv: timelineExportCSV
};
