import dayjs from "dayjs";
const LEVEL_TRACE = 0;
const LEVEL_DEBUG = 1;
const LEVEL_INFO = 2;
const LEVEL_WARN = 3;
const LEVEL_ERROR = 4;
export const logLevel = LEVEL_INFO;
const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss.SSS";

export function infoLog(message) {
  if (logLevel <= LEVEL_INFO) {
    console.log(`${dayjs(new Date()).format(DATE_FORMAT)} ${message}`);
  }
}

export function debugLog(message) {
  if (logLevel <= LEVEL_DEBUG) {
    console.warn(`${dayjs(new Date()).format(DATE_FORMAT)} ${message}`);
  }
}

export function traceLog(message) {
  if (logLevel <= LEVEL_TRACE) {
    console.trace(`${dayjs(new Date()).format(DATE_FORMAT)} ${message}`);
  }
}

export function warnLog(message, ...param) {
  if (logLevel <= LEVEL_WARN) {
    console.warn(`${dayjs(new Date()).format(DATE_FORMAT)} ${message}`, ...param);
  }
}

export function errorLog(message) {
  if (logLevel <= LEVEL_ERROR) {
    console.error(`${dayjs(new Date()).format(DATE_FORMAT)} ${message}`);
    console.error(message);
  }
}

export function isDebug() {
  return logLevel <= LEVEL_DEBUG;
}