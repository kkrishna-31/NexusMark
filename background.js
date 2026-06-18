import { captureTab } from './utils/capture.js';

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "capture") return;

  try {
    const captureData = await captureTab();
    await chrome.storage.session.set({ pendingCapture: captureData });

    chrome.windows.create({
      url: chrome.runtime.getURL("popup/capture.html"),
      type: "popup",
      width: 400,
      height: 580
    });
  } catch (error) {
    console.error("Capture failed:", error);
  }
});
