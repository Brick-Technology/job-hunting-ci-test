import { debugLog, errorLog } from "../../common/log";
import { OFFSCREEN, WEB_WORKER } from "../../common/api/bridgeCommon";

const chunkSize = 1024 * 1024 * 50;

export function postSuccessMessage(message, data) {
  // Here will throw exception "Message length exceeded maximum allowed length."
  // IPC messages will fail at > 128 MB. Restrict extension messages to 64 MB.
  // https://chromium.googlesource.com/chromium/src.git/+/refs/tags/134.0.6946.1/extensions/renderer/api/messaging/messaging_util.cc
  if (typeof data === 'string' && data.length > chunkSize) {
    let resultLength = data.length;
    let chunkTotal = parseInt(resultLength / chunkSize);
    if (resultLength % chunkSize > 0) {
      chunkTotal += 1;
    }
    for (let i = 0; i < chunkTotal; i++) {
      let currentLength = i * chunkSize;
      let chunk = i + 1;
      if (chunk == chunkTotal) {
        //last chunk
        _postSuccessMessage(message, data.slice(currentLength, resultLength), { chunk, chunkTotal });
      } else {
        let nextLength = chunk * chunkSize;
        _postSuccessMessage(message, data.slice(currentLength, nextLength), { chunk, chunkTotal });
      }
    }
  } else {
    _postSuccessMessage(message, data);
  }
}

export function _postSuccessMessage(message, data, { chunk = null, chunkTotal = null } = {}) {
  message.from = WEB_WORKER;
  message.to = OFFSCREEN;
  debugLog(
    "7.[worker][send][" +
    message.from +
    " -> " +
    message.to +
    "] message [action=" +
    message.action +
    ",invokeEnv=" +
    message.invokeEnv +
    ",callbackId=" +
    message.callbackId +
    ",error=" +
    message.error +
    "]"
  );
  message.chunk = chunk;
  message.chunkTotal = chunkTotal;
  let resultMessage = JSON.parse(JSON.stringify(message));
  resultMessage.data = data;
  postMessage({
    data: resultMessage,
  });
}

export function postErrorMessage(message, error) {
  message.from = WEB_WORKER;
  message.to = OFFSCREEN;
  errorLog(
    "7.[worker][send][" +
    message.from +
    " -> " +
    message.to +
    "] message [action=" +
    message.action +
    ",invokeEnv=" +
    message.invokeEnv +
    ",callbackId=" +
    message.callbackId +
    ",error=" +
    message.error +
    "]"
  );
  let resultMessage = JSON.parse(JSON.stringify(message));
  debugLog(resultMessage);
  resultMessage.error = error;
  postMessage({
    data: resultMessage,
  });
}
