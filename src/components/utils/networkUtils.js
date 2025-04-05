/**
 * Checks if the current connection is slow
 * @returns {boolean} True if connection is slow
 */
export const detectSlowConnection = () => {
    if ("connection" in navigator && navigator.connection) {
      const connection = navigator.connection;
      return connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
    }
    return false;
  };
  
  /**
   * Adds a listener for connection changes
   * @param {Function} callback - Function to call when connection changes
   * @returns {Function} Function to remove the listener
   */
  export const addConnectionChangeListener = (callback) => {
    if ("connection" in navigator && navigator.connection) {
      const connection = navigator.connection;
      connection.addEventListener("change", callback);
      return () => connection.removeEventListener("change", callback);
    }
    return () => {};
  };