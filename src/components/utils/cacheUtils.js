/**
 * Get the current timestamp
 * @returns {number} Current timestamp in milliseconds
 */
export const getCurrentTimestamp = () => new Date().getTime();

/**
 * Update the timestamp for a specific cache item
 * @param {string} key - The cache key to update
 */
export const updateCacheTimestamp = (key) => {
  const cache = JSON.parse(localStorage.getItem("kill") || "{}");
  cache[key] = getCurrentTimestamp();
  localStorage.setItem("kill", JSON.stringify(cache));
};