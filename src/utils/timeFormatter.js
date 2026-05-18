/**
 * Formats a time in seconds to a cinematic-style timestamp string.
 * Supports hh:mm:ss and mm:ss, zero-padding, and handles all edge cases cleanly.
 *
 * @param {number} seconds - The time in seconds to format.
 * @param {number} referenceDuration - The total duration of the media in seconds.
 *                                     Used to determine if hh:mm:ss format is needed consistently.
 * @returns {string} The formatted timestamp (e.g. "25:56", "01:25:56", "00:00").
 */
export const formatTime = (seconds, referenceDuration = 0) => {
  // 1. Handle invalid/NaN/Infinity/negative values
  if (
    seconds === null ||
    seconds === undefined ||
    isNaN(seconds) ||
    !isFinite(seconds) ||
    seconds < 0
  ) {
    // Determine if reference duration dictates hours format
    const useHours = referenceDuration && !isNaN(referenceDuration) && isFinite(referenceDuration) && referenceDuration >= 3600;
    return useHours ? "00:00:00" : "00:00";
  }

  // 2. Compute hours, minutes, seconds
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  // 3. Determine if we should show hours.
  // We show hours if:
  // - The referenceDuration is valid, finite, and >= 3600 seconds (1 hour)
  // - Or the seconds parameter itself is >= 3600 (useful as a fallback if referenceDuration isn't supplied)
  const refDurHasHours = referenceDuration && !isNaN(referenceDuration) && isFinite(referenceDuration) && referenceDuration >= 3600;
  const currentHasHours = hours > 0;
  const useHours = refDurHasHours || currentHasHours;

  if (useHours) {
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = secs.toString().padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  } else {
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = secs.toString().padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
  }
};
