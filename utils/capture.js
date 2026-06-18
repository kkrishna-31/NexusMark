export async function captureTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) throw new Error("No active tab found");

  const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });

  return {
    screenshot,
    url: tab.url,
    title: tab.title,
    timestamp: Date.now()
  };
}
