const ELARA_TIMELINE_KEY = "elara_timeline_engine_v1";

function timelineLoad() {
  try {
    return JSON.parse(localStorage.getItem(ELARA_TIMELINE_KEY)) || [];
  } catch (error) {
    console.error("Timeline load failed:", error);
    return [];
  }
}

function timelineSave(events) {
  localStorage.setItem(ELARA_TIMELINE_KEY, JSON.stringify(events));
}

function timelineCreateEvent({
  projectId = "default-project",
  projectName = "Unnamed Project",
  type = "General Update",
  title = "Project update",
  description = "",
  source = "Manual",
  confidence = "Confirmed",
  contractor = "",
  location = "",
  amount = 0,
  progress = null,
  status = "",
  attachments = [],
  metadata = {}
} = {}) {
  const events = timelineLoad();

  const event = {
    id: crypto.randomUUID(),
    projectId,
    projectName,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    type,
    title,
    description,
    source,
    confidence,
    contractor,
    location,
    amount: Number(amount || 0),
    progress: progress === null ? null : Number(progress),
    status,
    attachments,
    metadata
  };

  events.unshift(event);
  timelineSave(events);

  window.dispatchEvent(new CustomEvent("elara:timeline-event-created", {
    detail: event
  }));

  return event;
}

function timelineGetAll() {
  return timelineLoad();
}

function timelineGetByProject(projectId) {
  return timelineLoad().filter(event => event.projectId === projectId);
}

function timelineDeleteEvent(eventId) {
  const events = timelineLoad().filter(event => event.id !== eventId);
  timelineSave(events);
  return events;
}

function timelineClearProject(projectId) {
  const events = timelineLoad().filter(event => event.projectId !== projectId);
  timelineSave(events);
  return events;
}

window.ELARATimeline = {
  createEvent: timelineCreateEvent,
  getAll: timelineGetAll,
  getByProject: timelineGetByProject,
  deleteEvent: timelineDeleteEvent,
  clearProject: timelineClearProject
};
