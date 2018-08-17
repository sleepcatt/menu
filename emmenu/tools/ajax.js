import guid from 'em-underline/guid';
import { setStorage, getStorage } from './localstorage';

function getError(action, option, xhr) {
  const msg = `fail to post ${action} ${xhr.status}'`;
  const err = new Error(msg);
  err.status = xhr.status;
  err.method = 'post';
  err.url = action;
  return err;
}

function getBody(xhr) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

function hOwnProperty(item, attr) {
  return Object.prototype.hasOwnProperty.call(item, attr);
}

export default function upload(option) {
  if (typeof XMLHttpRequest === 'undefined') {
    return;
  }

  const xhr = new XMLHttpRequest();
  const { action } = option;

  xhr.onerror = function error(e) {
    option.onError(e);
  };

  xhr.onload = function onload() {
    if (xhr.status < 200 || xhr.status >= 300) {
      return option.onError(getError(action, option, xhr), getBody(xhr));
    }
    return option.onSuccess(getBody(xhr));
  };
  if (option.type === 'POST') {
    xhr.open('post', action, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  } else {
    xhr.open('get', action, true);
  }

  const getGuid = getStorage('X-Session-Id') || guid();
  setStorage('X-Session-Id', getGuid);

  xhr.setRequestHeader('X-Session-Id', getGuid);
  const headers = option.headers || {};

  Object.keys(headers).forEach((item) => {
    if (hOwnProperty(headers, item) && headers[item] !== null) {
      xhr.setRequestHeader(item, headers[item]);
    }
  });

  if (option.type === 'POST') {
    xhr.send(option.data);
  } else {
    xhr.send();
  }
}
