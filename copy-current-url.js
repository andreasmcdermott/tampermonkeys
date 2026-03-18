// ==UserScript==
// @name         Copy Current URL + Toast (Cmd+Shift+.)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Copies the current page URL when pressing Cmd+Shift+Y and shows a toast
// @match        *://*/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  "use strict";

  function showToast(message, isError = false) {
    const existing = document.getElementById("__tm_copy_url_toast__");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "__tm_copy_url_toast__";
    toast.textContent = message;

    Object.assign(toast.style, {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: "2147483647",
      background: isError ? "rgba(180, 30, 30, 0.95)" : "rgba(20, 20, 20, 0.92)",
      color: "#fff",
      padding: "10px 12px",
      borderRadius: "8px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSize: "13px",
      lineHeight: "1.2",
      boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      opacity: "0",
      transform: "translateY(-4px)",
      transition: "opacity 160ms ease, transform 160ms ease",
      pointerEvents: "none",
      maxWidth: "min(420px, 80vw)",
      wordBreak: "break-all",
    });

    document.documentElement.appendChild(toast);

    // trigger transition
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-4px)";
      setTimeout(() => toast.remove(), 180);
    }, 1600);
  }

  async function copyCurrentUrl() {
    const url = window.location.href;

    try {
      if (typeof GM_setClipboard === "function") {
        GM_setClipboard(url, "text");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error("Clipboard API unavailable");
      }

      showToast("Copied URL to clipboard");
      console.log("[TM] Copied URL:", url);
    } catch (err) {
      showToast("Failed to copy URL", true);
      console.error("[TM] Failed to copy URL:", err);
    }
  }

  window.addEventListener(
    "keydown",
    (e) => {
      // Shortcut: Cmd+Shift+Y (macOS)
      const isShortcut = e.metaKey && e.shiftKey && (e.code === "Period");
      if (!isShortcut) return;

      // Helps avoid typing into fields and triggering accidentally
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const isTypingContext =
        tag === "input" ||
        tag === "textarea" ||
        document.activeElement?.isContentEditable;
      if (isTypingContext) return;

      e.preventDefault();
      e.stopPropagation();

      copyCurrentUrl();
    },
    true
  );
})();
