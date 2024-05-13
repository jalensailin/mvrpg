/* eslint-disable no-console */

export default class Logger {
  static log(...args) {
    console.log("MV Log |", ...args);
  }

  static warn(...args) {
    console.warn("MV Warn |", ...args);
  }

  static error(...args) {
    console.error("MV Error |", ...args);
  }

  static debug(...args) {
    console.debug("MV Debug |", ...args);
    if (false) console.trace(...args);
  }
}
