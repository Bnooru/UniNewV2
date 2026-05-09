/* ============================================================
   UniNew — Admin / script.js
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const session = Auth.requireAuth(['admin']);
  if (!session) return;
  initHeader(session);
});
