"use client";

import { downloadText } from "./index";
import { trackEvent } from "@/services/analytics";

/**
 * Export an HTML fragment as a .doc file. Microsoft Word opens Word-flavoured
 * HTML natively, so this gives a real editable document without heavy libraries.
 */
export function downloadWord(filename: string, title: string, innerHTML: string, toolSlug?: string) {
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${title}</title><style>
    body{font-family:Arial,sans-serif;font-size:11pt;color:#000}
    h1{font-size:16pt} h2{font-size:13pt;color:#0b5f59}
    table{border-collapse:collapse;width:100%} td,th{border:1px solid #333;padding:6px;vertical-align:top}
  </style></head><body>${innerHTML}</body></html>`;
  trackEvent("word_export", { toolSlug });
  downloadText(filename, html, "application/msword");
}
