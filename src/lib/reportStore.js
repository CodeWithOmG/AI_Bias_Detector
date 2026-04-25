// Use global pattern to survive HMR in development
const globalForReportStore = global;

if (!globalForReportStore.reportStore) {
  globalForReportStore.reportStore = new Map();
}

const reportStore = globalForReportStore.reportStore;

export function saveReport(id, data, fileName) {
  reportStore.set(id, { data, fileName, timestamp: Date.now() });
  
  // Cleanup after 5 minutes
  setTimeout(() => {
    reportStore.delete(id);
  }, 5 * 60 * 1000);
}

export function getReport(id) {
  return reportStore.get(id);
}
