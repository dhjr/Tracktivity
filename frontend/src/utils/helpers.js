/**
 * Returns uppercase initials (max 2 chars) from a full name.
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Consistently formatted date string to prevent hydration mismatches.
 * @param {string|Date} dateSource
 * @param {Intl.DateTimeFormatOptions} [options] - Optional formatting options.
 * @returns {string}
 */
export function formatDate(dateSource, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  if (!dateSource) return "N/A";
  const date = new Date(dateSource);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  // Using 'en-GB' as the base locale ensures consistency (DD/MM/YYYY by default).
  // Passing options allows for variations like { month: 'short', ... } while sticking to a fixed locale.
  return date.toLocaleDateString("en-GB", options);
}
