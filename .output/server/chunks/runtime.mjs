import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import http, { Server as Server$1 } from 'node:http';
import https, { Server } from 'node:https';
import { promises, existsSync } from 'fs';
import { dirname as dirname$1, resolve as resolve$1, join } from 'path';
import BaseStyle from '@primevue/core/base/style';
import { isNotEmpty } from '@primeuix/utils/object';
import { Theme } from '@primeuix/styled';
import { promises as promises$1 } from 'node:fs';
import { fileURLToPath } from 'node:url';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  const _value = value.trim();
  if (
    // eslint-disable-next-line unicorn/prefer-at
    value[0] === '"' && value.endsWith('"') && !value.includes("\\")
  ) {
    return _value.slice(1, -1);
  }
  if (_value.length <= 9) {
    const _lval = _value.toLowerCase();
    if (_lval === "true") {
      return true;
    }
    if (_lval === "false") {
      return false;
    }
    if (_lval === "undefined") {
      return void 0;
    }
    if (_lval === "null") {
      return null;
    }
    if (_lval === "nan") {
      return Number.NaN;
    }
    if (_lval === "infinity") {
      return Number.POSITIVE_INFINITY;
    }
    if (_lval === "-infinity") {
      return Number.NEGATIVE_INFINITY;
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = {};
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map((_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const defaults = Object.freeze({
  ignoreUnknown: false,
  respectType: false,
  respectFunctionNames: false,
  respectFunctionProperties: false,
  unorderedObjects: true,
  unorderedArrays: false,
  unorderedSets: false,
  excludeKeys: void 0,
  excludeValues: void 0,
  replacer: void 0
});
function objectHash(object, options) {
  if (options) {
    options = { ...defaults, ...options };
  } else {
    options = defaults;
  }
  const hasher = createHasher(options);
  hasher.dispatch(object);
  return hasher.toString();
}
const defaultPrototypesKeys = Object.freeze([
  "prototype",
  "__proto__",
  "constructor"
]);
function createHasher(options) {
  let buff = "";
  let context = /* @__PURE__ */ new Map();
  const write = (str) => {
    buff += str;
  };
  return {
    toString() {
      return buff;
    },
    getContext() {
      return context;
    },
    dispatch(value) {
      if (options.replacer) {
        value = options.replacer(value);
      }
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    },
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      if (objectLength < 10) {
        objType = "unknown:[" + objString + "]";
      } else {
        objType = objString.slice(8, objectLength - 1);
      }
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = context.get(object)) === void 0) {
        context.set(object, context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        write("buffer:");
        return write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else if (!options.ignoreUnknown) {
          this.unkown(object, objType);
        }
      } else {
        let keys = Object.keys(object);
        if (options.unorderedObjects) {
          keys = keys.sort();
        }
        let extraKeys = [];
        if (options.respectType !== false && !isNativeFunction(object)) {
          extraKeys = defaultPrototypesKeys;
        }
        if (options.excludeKeys) {
          keys = keys.filter((key) => {
            return !options.excludeKeys(key);
          });
          extraKeys = extraKeys.filter((key) => {
            return !options.excludeKeys(key);
          });
        }
        write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          write(":");
          if (!options.excludeValues) {
            this.dispatch(object[key]);
          }
          write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    },
    array(arr, unordered) {
      unordered = unordered === void 0 ? options.unorderedArrays !== false : unordered;
      write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = createHasher(options);
        hasher.dispatch(entry);
        for (const [key, value] of hasher.getContext()) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    },
    date(date) {
      return write("date:" + date.toJSON());
    },
    symbol(sym) {
      return write("symbol:" + sym.toString());
    },
    unkown(value, type) {
      write(type);
      if (!value) {
        return;
      }
      write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          Array.from(value.entries()),
          true
          /* ordered */
        );
      }
    },
    error(err) {
      return write("error:" + err.toString());
    },
    boolean(bool) {
      return write("bool:" + bool);
    },
    string(string) {
      write("string:" + string.length + ":");
      write(string);
    },
    function(fn) {
      write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
      if (options.respectFunctionNames !== false) {
        this.dispatch("function-name:" + String(fn.name));
      }
      if (options.respectFunctionProperties) {
        this.object(fn);
      }
    },
    number(number) {
      return write("number:" + number);
    },
    xml(xml) {
      return write("xml:" + xml.toString());
    },
    null() {
      return write("Null");
    },
    undefined() {
      return write("Undefined");
    },
    regexp(regex) {
      return write("regex:" + regex.toString());
    },
    uint8array(arr) {
      write("uint8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint8clampedarray(arr) {
      write("uint8clampedarray:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int8array(arr) {
      write("int8array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint16array(arr) {
      write("uint16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int16array(arr) {
      write("int16array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    uint32array(arr) {
      write("uint32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    int32array(arr) {
      write("int32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float32array(arr) {
      write("float32array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    float64array(arr) {
      write("float64array:");
      return this.dispatch(Array.prototype.slice.call(arr));
    },
    arraybuffer(arr) {
      write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    },
    url(url) {
      return write("url:" + url.toString());
    },
    map(map) {
      write("map:");
      const arr = [...map];
      return this.array(arr, options.unorderedSets !== false);
    },
    set(set) {
      write("set:");
      const arr = [...set];
      return this.array(arr, options.unorderedSets !== false);
    },
    file(file) {
      write("file:");
      return this.dispatch([file.name, file.size, file.type, file.lastModfied]);
    },
    blob() {
      if (options.ignoreUnknown) {
        return write("[blob]");
      }
      throw new Error(
        'Hashing Blob objects is currently not supported\nUse "options.replacer" or "options.ignoreUnknown"\n'
      );
    },
    domwindow() {
      return write("domwindow");
    },
    bigint(number) {
      return write("bigint:" + number.toString());
    },
    /* Node.js standard native objects */
    process() {
      return write("process");
    },
    timer() {
      return write("timer");
    },
    pipe() {
      return write("pipe");
    },
    tcp() {
      return write("tcp");
    },
    udp() {
      return write("udp");
    },
    tty() {
      return write("tty");
    },
    statwatcher() {
      return write("statwatcher");
    },
    securecontext() {
      return write("securecontext");
    },
    connection() {
      return write("connection");
    },
    zlib() {
      return write("zlib");
    },
    context() {
      return write("context");
    },
    nodescript() {
      return write("nodescript");
    },
    httpparser() {
      return write("httpparser");
    },
    dataview() {
      return write("dataview");
    },
    signal() {
      return write("signal");
    },
    fsevent() {
      return write("fsevent");
    },
    tlswrap() {
      return write("tlswrap");
    }
  };
}
const nativeFunc = "[native code] }";
const nativeFuncLength = nativeFunc.length;
function isNativeFunction(f) {
  if (typeof f !== "function") {
    return false;
  }
  return Function.prototype.toString.call(f).slice(-nativeFuncLength) === nativeFunc;
}

class WordArray {
  constructor(words, sigBytes) {
    words = this.words = words || [];
    this.sigBytes = sigBytes === void 0 ? words.length * 4 : sigBytes;
  }
  toString(encoder) {
    return (encoder || Hex).stringify(this);
  }
  concat(wordArray) {
    this.clamp();
    if (this.sigBytes % 4) {
      for (let i = 0; i < wordArray.sigBytes; i++) {
        const thatByte = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
        this.words[this.sigBytes + i >>> 2] |= thatByte << 24 - (this.sigBytes + i) % 4 * 8;
      }
    } else {
      for (let j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[this.sigBytes + j >>> 2] = wordArray.words[j >>> 2];
      }
    }
    this.sigBytes += wordArray.sigBytes;
    return this;
  }
  clamp() {
    this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8;
    this.words.length = Math.ceil(this.sigBytes / 4);
  }
  clone() {
    return new WordArray([...this.words]);
  }
}
const Hex = {
  stringify(wordArray) {
    const hexChars = [];
    for (let i = 0; i < wordArray.sigBytes; i++) {
      const bite = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      hexChars.push((bite >>> 4).toString(16), (bite & 15).toString(16));
    }
    return hexChars.join("");
  }
};
const Base64 = {
  stringify(wordArray) {
    const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const base64Chars = [];
    for (let i = 0; i < wordArray.sigBytes; i += 3) {
      const byte1 = wordArray.words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
      const byte2 = wordArray.words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
      const byte3 = wordArray.words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
      const triplet = byte1 << 16 | byte2 << 8 | byte3;
      for (let j = 0; j < 4 && i * 8 + j * 6 < wordArray.sigBytes * 8; j++) {
        base64Chars.push(keyStr.charAt(triplet >>> 6 * (3 - j) & 63));
      }
    }
    return base64Chars.join("");
  }
};
const Latin1 = {
  parse(latin1Str) {
    const latin1StrLength = latin1Str.length;
    const words = [];
    for (let i = 0; i < latin1StrLength; i++) {
      words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
    }
    return new WordArray(words, latin1StrLength);
  }
};
const Utf8 = {
  parse(utf8Str) {
    return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
  }
};
class BufferedBlockAlgorithm {
  constructor() {
    this._data = new WordArray();
    this._nDataBytes = 0;
    this._minBufferSize = 0;
    this.blockSize = 512 / 32;
  }
  reset() {
    this._data = new WordArray();
    this._nDataBytes = 0;
  }
  _append(data) {
    if (typeof data === "string") {
      data = Utf8.parse(data);
    }
    this._data.concat(data);
    this._nDataBytes += data.sigBytes;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _doProcessBlock(_dataWords, _offset) {
  }
  _process(doFlush) {
    let processedWords;
    let nBlocksReady = this._data.sigBytes / (this.blockSize * 4);
    if (doFlush) {
      nBlocksReady = Math.ceil(nBlocksReady);
    } else {
      nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    }
    const nWordsReady = nBlocksReady * this.blockSize;
    const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += this.blockSize) {
        this._doProcessBlock(this._data.words, offset);
      }
      processedWords = this._data.words.splice(0, nWordsReady);
      this._data.sigBytes -= nBytesReady;
    }
    return new WordArray(processedWords, nBytesReady);
  }
}
class Hasher extends BufferedBlockAlgorithm {
  update(messageUpdate) {
    this._append(messageUpdate);
    this._process();
    return this;
  }
  finalize(messageUpdate) {
    if (messageUpdate) {
      this._append(messageUpdate);
    }
  }
}

const H = [
  1779033703,
  -1150833019,
  1013904242,
  -1521486534,
  1359893119,
  -1694144372,
  528734635,
  1541459225
];
const K = [
  1116352408,
  1899447441,
  -1245643825,
  -373957723,
  961987163,
  1508970993,
  -1841331548,
  -1424204075,
  -670586216,
  310598401,
  607225278,
  1426881987,
  1925078388,
  -2132889090,
  -1680079193,
  -1046744716,
  -459576895,
  -272742522,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  -1740746414,
  -1473132947,
  -1341970488,
  -1084653625,
  -958395405,
  -710438585,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  -2117940946,
  -1838011259,
  -1564481375,
  -1474664885,
  -1035236496,
  -949202525,
  -778901479,
  -694614492,
  -200395387,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  -2067236844,
  -1933114872,
  -1866530822,
  -1538233109,
  -1090935817,
  -965641998
];
const W = [];
class SHA256 extends Hasher {
  constructor() {
    super(...arguments);
    this._hash = new WordArray([...H]);
  }
  reset() {
    super.reset();
    this._hash = new WordArray([...H]);
  }
  _doProcessBlock(M, offset) {
    const H2 = this._hash.words;
    let a = H2[0];
    let b = H2[1];
    let c = H2[2];
    let d = H2[3];
    let e = H2[4];
    let f = H2[5];
    let g = H2[6];
    let h = H2[7];
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        W[i] = M[offset + i] | 0;
      } else {
        const gamma0x = W[i - 15];
        const gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
        const gamma1x = W[i - 2];
        const gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
      }
      const ch = e & f ^ ~e & g;
      const maj = a & b ^ a & c ^ b & c;
      const sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
      const sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
      const t1 = h + sigma1 + ch + K[i] + W[i];
      const t2 = sigma0 + maj;
      h = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    H2[0] = H2[0] + a | 0;
    H2[1] = H2[1] + b | 0;
    H2[2] = H2[2] + c | 0;
    H2[3] = H2[3] + d | 0;
    H2[4] = H2[4] + e | 0;
    H2[5] = H2[5] + f | 0;
    H2[6] = H2[6] + g | 0;
    H2[7] = H2[7] + h | 0;
  }
  finalize(messageUpdate) {
    super.finalize(messageUpdate);
    const nBitsTotal = this._nDataBytes * 8;
    const nBitsLeft = this._data.sigBytes * 8;
    this._data.words[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(
      nBitsTotal / 4294967296
    );
    this._data.words[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
    this._data.sigBytes = this._data.words.length * 4;
    this._process();
    return this._hash;
  }
}
function sha256base64(message) {
  return new SHA256().finalize(message).toString(Base64);
}

function hash(object, options = {}) {
  const hashed = typeof object === "string" ? object : objectHash(object, options);
  return sha256base64(hashed).slice(0, 10);
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function rawHeaders(headers) {
  const rawHeaders2 = [];
  for (const key in headers) {
    if (Array.isArray(headers[key])) {
      for (const h of headers[key]) {
        rawHeaders2.push(key, h);
      }
    } else {
      rawHeaders2.push(key, headers[key]);
    }
  }
  return rawHeaders2;
}
function mergeFns(...functions) {
  return function(...args) {
    for (const fn of functions) {
      fn(...args);
    }
  };
}
function createNotImplementedError(name) {
  throw new Error(`[unenv] ${name} is not implemented yet!`);
}

let defaultMaxListeners = 10;
let EventEmitter$1 = class EventEmitter {
  __unenv__ = true;
  _events = /* @__PURE__ */ Object.create(null);
  _maxListeners;
  static get defaultMaxListeners() {
    return defaultMaxListeners;
  }
  static set defaultMaxListeners(arg) {
    if (typeof arg !== "number" || arg < 0 || Number.isNaN(arg)) {
      throw new RangeError(
        'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + "."
      );
    }
    defaultMaxListeners = arg;
  }
  setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || Number.isNaN(n)) {
      throw new RangeError(
        'The value of "n" is out of range. It must be a non-negative number. Received ' + n + "."
      );
    }
    this._maxListeners = n;
    return this;
  }
  getMaxListeners() {
    return _getMaxListeners(this);
  }
  emit(type, ...args) {
    if (!this._events[type] || this._events[type].length === 0) {
      return false;
    }
    if (type === "error") {
      let er;
      if (args.length > 0) {
        er = args[0];
      }
      if (er instanceof Error) {
        throw er;
      }
      const err = new Error(
        "Unhandled error." + (er ? " (" + er.message + ")" : "")
      );
      err.context = er;
      throw err;
    }
    for (const _listener of this._events[type]) {
      (_listener.listener || _listener).apply(this, args);
    }
    return true;
  }
  addListener(type, listener) {
    return _addListener(this, type, listener, false);
  }
  on(type, listener) {
    return _addListener(this, type, listener, false);
  }
  prependListener(type, listener) {
    return _addListener(this, type, listener, true);
  }
  once(type, listener) {
    return this.on(type, _wrapOnce(this, type, listener));
  }
  prependOnceListener(type, listener) {
    return this.prependListener(type, _wrapOnce(this, type, listener));
  }
  removeListener(type, listener) {
    return _removeListener(this, type, listener);
  }
  off(type, listener) {
    return this.removeListener(type, listener);
  }
  removeAllListeners(type) {
    return _removeAllListeners(this, type);
  }
  listeners(type) {
    return _listeners(this, type, true);
  }
  rawListeners(type) {
    return _listeners(this, type, false);
  }
  listenerCount(type) {
    return this.rawListeners(type).length;
  }
  eventNames() {
    return Object.keys(this._events);
  }
};
function _addListener(target, type, listener, prepend) {
  _checkListener(listener);
  if (target._events.newListener !== void 0) {
    target.emit("newListener", type, listener.listener || listener);
  }
  if (!target._events[type]) {
    target._events[type] = [];
  }
  if (prepend) {
    target._events[type].unshift(listener);
  } else {
    target._events[type].push(listener);
  }
  const maxListeners = _getMaxListeners(target);
  if (maxListeners > 0 && target._events[type].length > maxListeners && !target._events[type].warned) {
    target._events[type].warned = true;
    const warning = new Error(
      `[unenv] Possible EventEmitter memory leak detected. ${target._events[type].length} ${type} listeners added. Use emitter.setMaxListeners() to increase limit`
    );
    warning.name = "MaxListenersExceededWarning";
    warning.emitter = target;
    warning.type = type;
    warning.count = target._events[type]?.length;
    console.warn(warning);
  }
  return target;
}
function _removeListener(target, type, listener) {
  _checkListener(listener);
  if (!target._events[type] || target._events[type].length === 0) {
    return target;
  }
  const lenBeforeFilter = target._events[type].length;
  target._events[type] = target._events[type].filter((fn) => fn !== listener);
  if (lenBeforeFilter === target._events[type].length) {
    return target;
  }
  if (target._events.removeListener) {
    target.emit("removeListener", type, listener.listener || listener);
  }
  if (target._events[type].length === 0) {
    delete target._events[type];
  }
  return target;
}
function _removeAllListeners(target, type) {
  if (!target._events[type] || target._events[type].length === 0) {
    return target;
  }
  if (target._events.removeListener) {
    for (const _listener of target._events[type]) {
      target.emit("removeListener", type, _listener.listener || _listener);
    }
  }
  delete target._events[type];
  return target;
}
function _wrapOnce(target, type, listener) {
  let fired = false;
  const wrapper = (...args) => {
    if (fired) {
      return;
    }
    target.removeListener(type, wrapper);
    fired = true;
    return args.length === 0 ? listener.call(target) : listener.apply(target, args);
  };
  wrapper.listener = listener;
  return wrapper;
}
function _getMaxListeners(target) {
  return target._maxListeners ?? EventEmitter$1.defaultMaxListeners;
}
function _listeners(target, type, unwrap) {
  let listeners = target._events[type];
  if (typeof listeners === "function") {
    listeners = [listeners];
  }
  return unwrap ? listeners.map((l) => l.listener || l) : listeners;
}
function _checkListener(listener) {
  if (typeof listener !== "function") {
    throw new TypeError(
      'The "listener" argument must be of type Function. Received type ' + typeof listener
    );
  }
}

const EventEmitter = globalThis.EventEmitter || EventEmitter$1;

class _Readable extends EventEmitter {
  __unenv__ = true;
  readableEncoding = null;
  readableEnded = true;
  readableFlowing = false;
  readableHighWaterMark = 0;
  readableLength = 0;
  readableObjectMode = false;
  readableAborted = false;
  readableDidRead = false;
  closed = false;
  errored = null;
  readable = false;
  destroyed = false;
  static from(_iterable, options) {
    return new _Readable(options);
  }
  constructor(_opts) {
    super();
  }
  _read(_size) {
  }
  read(_size) {
  }
  setEncoding(_encoding) {
    return this;
  }
  pause() {
    return this;
  }
  resume() {
    return this;
  }
  isPaused() {
    return true;
  }
  unpipe(_destination) {
    return this;
  }
  unshift(_chunk, _encoding) {
  }
  wrap(_oldStream) {
    return this;
  }
  push(_chunk, _encoding) {
    return false;
  }
  _destroy(_error, _callback) {
    this.removeAllListeners();
  }
  destroy(error) {
    this.destroyed = true;
    this._destroy(error);
    return this;
  }
  pipe(_destenition, _options) {
    return {};
  }
  compose(stream, options) {
    throw new Error("[unenv] Method not implemented.");
  }
  [Symbol.asyncDispose]() {
    this.destroy();
    return Promise.resolve();
  }
  // eslint-disable-next-line require-yield
  async *[Symbol.asyncIterator]() {
    throw createNotImplementedError("Readable.asyncIterator");
  }
  iterator(options) {
    throw createNotImplementedError("Readable.iterator");
  }
  map(fn, options) {
    throw createNotImplementedError("Readable.map");
  }
  filter(fn, options) {
    throw createNotImplementedError("Readable.filter");
  }
  forEach(fn, options) {
    throw createNotImplementedError("Readable.forEach");
  }
  reduce(fn, initialValue, options) {
    throw createNotImplementedError("Readable.reduce");
  }
  find(fn, options) {
    throw createNotImplementedError("Readable.find");
  }
  findIndex(fn, options) {
    throw createNotImplementedError("Readable.findIndex");
  }
  some(fn, options) {
    throw createNotImplementedError("Readable.some");
  }
  toArray(options) {
    throw createNotImplementedError("Readable.toArray");
  }
  every(fn, options) {
    throw createNotImplementedError("Readable.every");
  }
  flatMap(fn, options) {
    throw createNotImplementedError("Readable.flatMap");
  }
  drop(limit, options) {
    throw createNotImplementedError("Readable.drop");
  }
  take(limit, options) {
    throw createNotImplementedError("Readable.take");
  }
  asIndexedPairs(options) {
    throw createNotImplementedError("Readable.asIndexedPairs");
  }
}
const Readable = globalThis.Readable || _Readable;

class _Writable extends EventEmitter {
  __unenv__ = true;
  writable = true;
  writableEnded = false;
  writableFinished = false;
  writableHighWaterMark = 0;
  writableLength = 0;
  writableObjectMode = false;
  writableCorked = 0;
  closed = false;
  errored = null;
  writableNeedDrain = false;
  destroyed = false;
  _data;
  _encoding = "utf-8";
  constructor(_opts) {
    super();
  }
  pipe(_destenition, _options) {
    return {};
  }
  _write(chunk, encoding, callback) {
    if (this.writableEnded) {
      if (callback) {
        callback();
      }
      return;
    }
    if (this._data === void 0) {
      this._data = chunk;
    } else {
      const a = typeof this._data === "string" ? Buffer.from(this._data, this._encoding || encoding || "utf8") : this._data;
      const b = typeof chunk === "string" ? Buffer.from(chunk, encoding || this._encoding || "utf8") : chunk;
      this._data = Buffer.concat([a, b]);
    }
    this._encoding = encoding;
    if (callback) {
      callback();
    }
  }
  _writev(_chunks, _callback) {
  }
  _destroy(_error, _callback) {
  }
  _final(_callback) {
  }
  write(chunk, arg2, arg3) {
    const encoding = typeof arg2 === "string" ? this._encoding : "utf-8";
    const cb = typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : void 0;
    this._write(chunk, encoding, cb);
    return true;
  }
  setDefaultEncoding(_encoding) {
    return this;
  }
  end(arg1, arg2, arg3) {
    const callback = typeof arg1 === "function" ? arg1 : typeof arg2 === "function" ? arg2 : typeof arg3 === "function" ? arg3 : void 0;
    if (this.writableEnded) {
      if (callback) {
        callback();
      }
      return this;
    }
    const data = arg1 === callback ? void 0 : arg1;
    if (data) {
      const encoding = arg2 === callback ? void 0 : arg2;
      this.write(data, encoding, callback);
    }
    this.writableEnded = true;
    this.writableFinished = true;
    this.emit("close");
    this.emit("finish");
    return this;
  }
  cork() {
  }
  uncork() {
  }
  destroy(_error) {
    this.destroyed = true;
    delete this._data;
    this.removeAllListeners();
    return this;
  }
  compose(stream, options) {
    throw new Error("[h3] Method not implemented.");
  }
}
const Writable = globalThis.Writable || _Writable;

const __Duplex = class {
  allowHalfOpen = true;
  _destroy;
  constructor(readable = new Readable(), writable = new Writable()) {
    Object.assign(this, readable);
    Object.assign(this, writable);
    this._destroy = mergeFns(readable._destroy, writable._destroy);
  }
};
function getDuplex() {
  Object.assign(__Duplex.prototype, Readable.prototype);
  Object.assign(__Duplex.prototype, Writable.prototype);
  return __Duplex;
}
const _Duplex = /* @__PURE__ */ getDuplex();
const Duplex = globalThis.Duplex || _Duplex;

class Socket extends Duplex {
  __unenv__ = true;
  bufferSize = 0;
  bytesRead = 0;
  bytesWritten = 0;
  connecting = false;
  destroyed = false;
  pending = false;
  localAddress = "";
  localPort = 0;
  remoteAddress = "";
  remoteFamily = "";
  remotePort = 0;
  autoSelectFamilyAttemptedAddresses = [];
  readyState = "readOnly";
  constructor(_options) {
    super();
  }
  write(_buffer, _arg1, _arg2) {
    return false;
  }
  connect(_arg1, _arg2, _arg3) {
    return this;
  }
  end(_arg1, _arg2, _arg3) {
    return this;
  }
  setEncoding(_encoding) {
    return this;
  }
  pause() {
    return this;
  }
  resume() {
    return this;
  }
  setTimeout(_timeout, _callback) {
    return this;
  }
  setNoDelay(_noDelay) {
    return this;
  }
  setKeepAlive(_enable, _initialDelay) {
    return this;
  }
  address() {
    return {};
  }
  unref() {
    return this;
  }
  ref() {
    return this;
  }
  destroySoon() {
    this.destroy();
  }
  resetAndDestroy() {
    const err = new Error("ERR_SOCKET_CLOSED");
    err.code = "ERR_SOCKET_CLOSED";
    this.destroy(err);
    return this;
  }
}

class IncomingMessage extends Readable {
  __unenv__ = {};
  aborted = false;
  httpVersion = "1.1";
  httpVersionMajor = 1;
  httpVersionMinor = 1;
  complete = true;
  connection;
  socket;
  headers = {};
  trailers = {};
  method = "GET";
  url = "/";
  statusCode = 200;
  statusMessage = "";
  closed = false;
  errored = null;
  readable = false;
  constructor(socket) {
    super();
    this.socket = this.connection = socket || new Socket();
  }
  get rawHeaders() {
    return rawHeaders(this.headers);
  }
  get rawTrailers() {
    return [];
  }
  setTimeout(_msecs, _callback) {
    return this;
  }
  get headersDistinct() {
    return _distinct(this.headers);
  }
  get trailersDistinct() {
    return _distinct(this.trailers);
  }
}
function _distinct(obj) {
  const d = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key) {
      d[key] = (Array.isArray(value) ? value : [value]).filter(
        Boolean
      );
    }
  }
  return d;
}

class ServerResponse extends Writable {
  __unenv__ = true;
  statusCode = 200;
  statusMessage = "";
  upgrading = false;
  chunkedEncoding = false;
  shouldKeepAlive = false;
  useChunkedEncodingByDefault = false;
  sendDate = false;
  finished = false;
  headersSent = false;
  strictContentLength = false;
  connection = null;
  socket = null;
  req;
  _headers = {};
  constructor(req) {
    super();
    this.req = req;
  }
  assignSocket(socket) {
    socket._httpMessage = this;
    this.socket = socket;
    this.connection = socket;
    this.emit("socket", socket);
    this._flush();
  }
  _flush() {
    this.flushHeaders();
  }
  detachSocket(_socket) {
  }
  writeContinue(_callback) {
  }
  writeHead(statusCode, arg1, arg2) {
    if (statusCode) {
      this.statusCode = statusCode;
    }
    if (typeof arg1 === "string") {
      this.statusMessage = arg1;
      arg1 = void 0;
    }
    const headers = arg2 || arg1;
    if (headers) {
      if (Array.isArray(headers)) ; else {
        for (const key in headers) {
          this.setHeader(key, headers[key]);
        }
      }
    }
    this.headersSent = true;
    return this;
  }
  writeProcessing() {
  }
  setTimeout(_msecs, _callback) {
    return this;
  }
  appendHeader(name, value) {
    name = name.toLowerCase();
    const current = this._headers[name];
    const all = [
      ...Array.isArray(current) ? current : [current],
      ...Array.isArray(value) ? value : [value]
    ].filter(Boolean);
    this._headers[name] = all.length > 1 ? all : all[0];
    return this;
  }
  setHeader(name, value) {
    this._headers[name.toLowerCase()] = value;
    return this;
  }
  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }
  getHeaders() {
    return this._headers;
  }
  getHeaderNames() {
    return Object.keys(this._headers);
  }
  hasHeader(name) {
    return name.toLowerCase() in this._headers;
  }
  removeHeader(name) {
    delete this._headers[name.toLowerCase()];
  }
  addTrailers(_headers) {
  }
  flushHeaders() {
  }
  writeEarlyHints(_headers, cb) {
    if (typeof cb === "function") {
      cb();
    }
  }
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Error extends Error {
  constructor(message, opts = {}) {
    super(message, opts);
    __publicField$2(this, "statusCode", 500);
    __publicField$2(this, "fatal", false);
    __publicField$2(this, "unhandled", false);
    __publicField$2(this, "statusMessage");
    __publicField$2(this, "data");
    __publicField$2(this, "cause");
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
__publicField$2(H3Error, "__h3_error__", true);
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= opts.modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start, cookiesString.length));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders(
    getProxyRequestHeaders(event),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name)) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    for (const [key, value] of Object.entries(input)) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class H3Event {
  constructor(req, res) {
    __publicField(this, "__is_event__", true);
    // Context
    __publicField(this, "node");
    // Node
    __publicField(this, "web");
    // Web
    __publicField(this, "context", {});
    // Shared
    // Request
    __publicField(this, "_method");
    __publicField(this, "_path");
    __publicField(this, "_headers");
    __publicField(this, "_requestBody");
    // Response
    __publicField(this, "_handled", false);
    // Hooks
    __publicField(this, "_onBeforeResponseCalled");
    __publicField(this, "_onAfterResponseCalled");
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const { pathname } = parseURL(info.url || "/");
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

const s=globalThis.Headers,i=globalThis.AbortController,l=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function mergeFetchOptions(input, defaults, Headers = globalThis.Headers) {
  const merged = {
    ...defaults,
    ...input
  };
  if (defaults?.params && input?.params) {
    merged.params = {
      ...defaults?.params,
      ...input?.params
    };
  }
  if (defaults?.query && input?.query) {
    merged.query = {
      ...defaults?.query,
      ...input?.query
    };
  }
  if (defaults?.headers && input?.headers) {
    merged.headers = new Headers(defaults?.headers || {});
    for (const [key, value] of new Headers(input?.headers || {})) {
      merged.headers.set(key, value);
    }
  }
  return merged;
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  //  Gateway Timeout
]);
const nullBodyResponses$1 = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch$1(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: mergeFetchOptions(_options, globalOptions.defaults, Headers),
      response: void 0,
      error: void 0
    };
    context.options.method = context.options.method?.toUpperCase();
    if (context.options.onRequest) {
      await context.options.onRequest(context);
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query || context.options.params) {
        context.request = withQuery(context.request, {
          ...context.options.params,
          ...context.options.query
        });
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        context.options.body = typeof context.options.body === "string" ? context.options.body : JSON.stringify(context.options.body);
        context.options.headers = new Headers(context.options.headers || {});
        if (!context.options.headers.has("content-type")) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(
        () => controller.abort(),
        context.options.timeout
      );
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await context.options.onRequestError(context);
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = context.response.body && !nullBodyResponses$1.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await context.options.onResponse(context);
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await context.options.onResponseError(context);
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}) => createFetch$1({
    ...globalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch || createNodeFetch();
const Headers$1 = globalThis.Headers || s;
const AbortController = globalThis.AbortController || i;
createFetch$1({ fetch, Headers: Headers$1, AbortController });

const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createCall(handle) {
  return function callHandle(context) {
    const req = new IncomingMessage();
    const res = new ServerResponse(req);
    req.url = context.url || "/";
    req.method = context.method || "GET";
    req.headers = {};
    if (context.headers) {
      const headerEntries = typeof context.headers.entries === "function" ? context.headers.entries() : Object.entries(context.headers);
      for (const [name, value] of headerEntries) {
        if (!value) {
          continue;
        }
        req.headers[name.toLowerCase()] = value;
      }
    }
    req.headers.host = req.headers.host || context.host || "localhost";
    req.connection.encrypted = // @ts-ignore
    req.connection.encrypted || context.protocol === "https";
    req.body = context.body || null;
    req.__unenv__ = context.context;
    return handle(req, res).then(() => {
      let body = res._data;
      if (nullBodyResponses.has(res.statusCode) || req.method.toUpperCase() === "HEAD") {
        body = null;
        delete res._headers["content-length"];
      }
      const r = {
        body,
        headers: res._headers,
        status: res.statusCode,
        statusText: res.statusMessage
      };
      req.destroy();
      res.destroy();
      return r;
    });
  };
}

function createFetch(call, _fetch = global.fetch) {
  return async function ufetch(input, init) {
    const url = input.toString();
    if (!url.startsWith("/")) {
      return _fetch(url, init);
    }
    try {
      const r = await call({ url, ...init });
      return new Response(r.body, {
        status: r.status,
        statusText: r.statusText,
        headers: Object.fromEntries(
          Object.entries(r.headers).map(([name, value]) => [
            name,
            Array.isArray(value) ? value.join(",") : String(value) || ""
          ])
        )
      });
    } catch (error) {
      return new Response(error.toString(), {
        status: Number.parseInt(error.statusCode || error.code) || 500,
        statusText: error.statusText
      });
    }
  };
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /{{(.*?)}}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const defineAppConfig = (config) => config;

const appConfig0 = defineAppConfig({
  pocketbase: {
    url: "http://localhost:8090",
    prod: "https://bgs-studio-db.crunchymediadigital.id"
    // <-- No need to change this is reactive
  }
});

const inlineAppConfig = {
  "nuxt": {}
};

const appConfig = defuFn(appConfig0, inlineAppConfig);

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "0343c794-3ee3-4506-a33b-b668bac3e909",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {
    "MASTER_DB": "https://api-studio-db.crunchymediadigital.id",
    "primevue": {
      "usePrimeVue": true,
      "autoImport": true,
      "resolvePath": "",
      "importPT": "",
      "importTheme": "",
      "options": {
        "ripple": true,
        "inputVariant": "filled",
        "theme": {
          "preset": {
            "primitive": {
              "borderRadius": {
                "none": "0",
                "xs": "2px",
                "sm": "4px",
                "md": "6px",
                "lg": "8px",
                "xl": "12px"
              },
              "emerald": {
                "50": "#ecfdf5",
                "100": "#d1fae5",
                "200": "#a7f3d0",
                "300": "#6ee7b7",
                "400": "#34d399",
                "500": "#10b981",
                "600": "#059669",
                "700": "#047857",
                "800": "#065f46",
                "900": "#064e3b",
                "950": "#022c22"
              },
              "green": {
                "50": "#f0fdf4",
                "100": "#dcfce7",
                "200": "#bbf7d0",
                "300": "#86efac",
                "400": "#4ade80",
                "500": "#22c55e",
                "600": "#16a34a",
                "700": "#15803d",
                "800": "#166534",
                "900": "#14532d",
                "950": "#052e16"
              },
              "lime": {
                "50": "#f7fee7",
                "100": "#ecfccb",
                "200": "#d9f99d",
                "300": "#bef264",
                "400": "#a3e635",
                "500": "#84cc16",
                "600": "#65a30d",
                "700": "#4d7c0f",
                "800": "#3f6212",
                "900": "#365314",
                "950": "#1a2e05"
              },
              "red": {
                "50": "#fef2f2",
                "100": "#fee2e2",
                "200": "#fecaca",
                "300": "#fca5a5",
                "400": "#f87171",
                "500": "#ef4444",
                "600": "#dc2626",
                "700": "#b91c1c",
                "800": "#991b1b",
                "900": "#7f1d1d",
                "950": "#450a0a"
              },
              "orange": {
                "50": "#fff7ed",
                "100": "#ffedd5",
                "200": "#fed7aa",
                "300": "#fdba74",
                "400": "#fb923c",
                "500": "#f97316",
                "600": "#ea580c",
                "700": "#c2410c",
                "800": "#9a3412",
                "900": "#7c2d12",
                "950": "#431407"
              },
              "amber": {
                "50": "#fffbeb",
                "100": "#fef3c7",
                "200": "#fde68a",
                "300": "#fcd34d",
                "400": "#fbbf24",
                "500": "#f59e0b",
                "600": "#d97706",
                "700": "#b45309",
                "800": "#92400e",
                "900": "#78350f",
                "950": "#451a03"
              },
              "yellow": {
                "50": "#fefce8",
                "100": "#fef9c3",
                "200": "#fef08a",
                "300": "#fde047",
                "400": "#facc15",
                "500": "#eab308",
                "600": "#ca8a04",
                "700": "#a16207",
                "800": "#854d0e",
                "900": "#713f12",
                "950": "#422006"
              },
              "teal": {
                "50": "#f0fdfa",
                "100": "#ccfbf1",
                "200": "#99f6e4",
                "300": "#5eead4",
                "400": "#2dd4bf",
                "500": "#14b8a6",
                "600": "#0d9488",
                "700": "#0f766e",
                "800": "#115e59",
                "900": "#134e4a",
                "950": "#042f2e"
              },
              "cyan": {
                "50": "#ecfeff",
                "100": "#cffafe",
                "200": "#a5f3fc",
                "300": "#67e8f9",
                "400": "#22d3ee",
                "500": "#06b6d4",
                "600": "#0891b2",
                "700": "#0e7490",
                "800": "#155e75",
                "900": "#164e63",
                "950": "#083344"
              },
              "sky": {
                "50": "#f0f9ff",
                "100": "#e0f2fe",
                "200": "#bae6fd",
                "300": "#7dd3fc",
                "400": "#38bdf8",
                "500": "#0ea5e9",
                "600": "#0284c7",
                "700": "#0369a1",
                "800": "#075985",
                "900": "#0c4a6e",
                "950": "#082f49"
              },
              "blue": {
                "50": "#eff6ff",
                "100": "#dbeafe",
                "200": "#bfdbfe",
                "300": "#93c5fd",
                "400": "#60a5fa",
                "500": "#3b82f6",
                "600": "#2563eb",
                "700": "#1d4ed8",
                "800": "#1e40af",
                "900": "#1e3a8a",
                "950": "#172554"
              },
              "indigo": {
                "50": "#eef2ff",
                "100": "#e0e7ff",
                "200": "#c7d2fe",
                "300": "#a5b4fc",
                "400": "#818cf8",
                "500": "#6366f1",
                "600": "#4f46e5",
                "700": "#4338ca",
                "800": "#3730a3",
                "900": "#312e81",
                "950": "#1e1b4b"
              },
              "violet": {
                "50": "#f5f3ff",
                "100": "#ede9fe",
                "200": "#ddd6fe",
                "300": "#c4b5fd",
                "400": "#a78bfa",
                "500": "#8b5cf6",
                "600": "#7c3aed",
                "700": "#6d28d9",
                "800": "#5b21b6",
                "900": "#4c1d95",
                "950": "#2e1065"
              },
              "purple": {
                "50": "#faf5ff",
                "100": "#f3e8ff",
                "200": "#e9d5ff",
                "300": "#d8b4fe",
                "400": "#c084fc",
                "500": "#a855f7",
                "600": "#9333ea",
                "700": "#7e22ce",
                "800": "#6b21a8",
                "900": "#581c87",
                "950": "#3b0764"
              },
              "fuchsia": {
                "50": "#fdf4ff",
                "100": "#fae8ff",
                "200": "#f5d0fe",
                "300": "#f0abfc",
                "400": "#e879f9",
                "500": "#d946ef",
                "600": "#c026d3",
                "700": "#a21caf",
                "800": "#86198f",
                "900": "#701a75",
                "950": "#4a044e"
              },
              "pink": {
                "50": "#fdf2f8",
                "100": "#fce7f3",
                "200": "#fbcfe8",
                "300": "#f9a8d4",
                "400": "#f472b6",
                "500": "#ec4899",
                "600": "#db2777",
                "700": "#be185d",
                "800": "#9d174d",
                "900": "#831843",
                "950": "#500724"
              },
              "rose": {
                "50": "#fff1f2",
                "100": "#ffe4e6",
                "200": "#fecdd3",
                "300": "#fda4af",
                "400": "#fb7185",
                "500": "#f43f5e",
                "600": "#e11d48",
                "700": "#be123c",
                "800": "#9f1239",
                "900": "#881337",
                "950": "#4c0519"
              },
              "slate": {
                "50": "#f8fafc",
                "100": "#f1f5f9",
                "200": "#e2e8f0",
                "300": "#cbd5e1",
                "400": "#94a3b8",
                "500": "#64748b",
                "600": "#475569",
                "700": "#334155",
                "800": "#1e293b",
                "900": "#0f172a",
                "950": "#020617"
              },
              "gray": {
                "50": "#f9fafb",
                "100": "#f3f4f6",
                "200": "#e5e7eb",
                "300": "#d1d5db",
                "400": "#9ca3af",
                "500": "#6b7280",
                "600": "#4b5563",
                "700": "#374151",
                "800": "#1f2937",
                "900": "#111827",
                "950": "#030712"
              },
              "zinc": {
                "50": "#fafafa",
                "100": "#f4f4f5",
                "200": "#e4e4e7",
                "300": "#d4d4d8",
                "400": "#a1a1aa",
                "500": "#71717a",
                "600": "#52525b",
                "700": "#3f3f46",
                "800": "#27272a",
                "900": "#18181b",
                "950": "#09090b"
              },
              "neutral": {
                "50": "#fafafa",
                "100": "#f5f5f5",
                "200": "#e5e5e5",
                "300": "#d4d4d4",
                "400": "#a3a3a3",
                "500": "#737373",
                "600": "#525252",
                "700": "#404040",
                "800": "#262626",
                "900": "#171717",
                "950": "#0a0a0a"
              },
              "stone": {
                "50": "#fafaf9",
                "100": "#f5f5f4",
                "200": "#e7e5e4",
                "300": "#d6d3d1",
                "400": "#a8a29e",
                "500": "#78716c",
                "600": "#57534e",
                "700": "#44403c",
                "800": "#292524",
                "900": "#1c1917",
                "950": "#0c0a09"
              }
            },
            "semantic": {
              "transitionDuration": "0.2s",
              "focusRing": {
                "width": "1px",
                "style": "solid",
                "color": "{primary.color}",
                "offset": "2px",
                "shadow": "none"
              },
              "disabledOpacity": "0.6",
              "iconSize": "1rem",
              "anchorGutter": "2px",
              "primary": {
                "50": "{emerald.50}",
                "100": "{emerald.100}",
                "200": "{emerald.200}",
                "300": "{emerald.300}",
                "400": "{emerald.400}",
                "500": "{emerald.500}",
                "600": "{emerald.600}",
                "700": "{emerald.700}",
                "800": "{emerald.800}",
                "900": "{emerald.900}",
                "950": "{emerald.950}"
              },
              "formField": {
                "paddingX": "0.75rem",
                "paddingY": "0.5rem",
                "borderRadius": "{border.radius.md}",
                "focusRing": {
                  "width": "0",
                  "style": "none",
                  "color": "transparent",
                  "offset": "0",
                  "shadow": "none"
                },
                "transitionDuration": "{transition.duration}"
              },
              "list": {
                "padding": "0.25rem 0.25rem",
                "gap": "2px",
                "header": {
                  "padding": "0.5rem 1rem 0.25rem 1rem"
                },
                "option": {
                  "padding": "0.5rem 0.75rem",
                  "borderRadius": "{border.radius.sm}"
                },
                "optionGroup": {
                  "padding": "0.5rem 0.75rem",
                  "fontWeight": "600"
                }
              },
              "content": {
                "borderRadius": "{border.radius.md}"
              },
              "mask": {
                "transitionDuration": "0.15s"
              },
              "navigation": {
                "list": {
                  "padding": "0.25rem 0.25rem",
                  "gap": "2px"
                },
                "item": {
                  "padding": "0.5rem 0.75rem",
                  "borderRadius": "{border.radius.sm}",
                  "gap": "0.5rem"
                },
                "submenuLabel": {
                  "padding": "0.5rem 0.75rem",
                  "fontWeight": "600"
                },
                "submenuIcon": {
                  "size": "0.875rem"
                }
              },
              "overlay": {
                "select": {
                  "borderRadius": "{border.radius.md}",
                  "shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
                },
                "popover": {
                  "borderRadius": "{border.radius.md}",
                  "padding": "0.75rem",
                  "shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
                },
                "modal": {
                  "borderRadius": "{border.radius.xl}",
                  "padding": "1.25rem",
                  "shadow": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                },
                "navigation": {
                  "shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
                }
              },
              "colorScheme": {
                "light": {
                  "surface": {
                    "0": "#ffffff",
                    "50": "{slate.50}",
                    "100": "{slate.100}",
                    "200": "{slate.200}",
                    "300": "{slate.300}",
                    "400": "{slate.400}",
                    "500": "{slate.500}",
                    "600": "{slate.600}",
                    "700": "{slate.700}",
                    "800": "{slate.800}",
                    "900": "{slate.900}",
                    "950": "{slate.950}"
                  },
                  "primary": {
                    "color": "{primary.500}",
                    "contrastColor": "#ffffff",
                    "hoverColor": "{primary.600}",
                    "activeColor": "{primary.700}"
                  },
                  "highlight": {
                    "background": "{primary.50}",
                    "focusBackground": "{primary.100}",
                    "color": "{primary.700}",
                    "focusColor": "{primary.800}"
                  },
                  "mask": {
                    "background": "rgba(0,0,0,0.4)",
                    "color": "{surface.200}"
                  },
                  "formField": {
                    "background": "{surface.0}",
                    "disabledBackground": "{surface.200}",
                    "filledBackground": "{surface.50}",
                    "filledFocusBackground": "{surface.50}",
                    "borderColor": "{surface.300}",
                    "hoverBorderColor": "{surface.400}",
                    "focusBorderColor": "{primary.color}",
                    "invalidBorderColor": "{red.400}",
                    "color": "{surface.700}",
                    "disabledColor": "{surface.500}",
                    "placeholderColor": "{surface.500}",
                    "floatLabelColor": "{surface.500}",
                    "floatLabelFocusColor": "{surface.500}",
                    "floatLabelInvalidColor": "{red.400}",
                    "iconColor": "{surface.400}",
                    "shadow": "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgba(18, 18, 23, 0.05)"
                  },
                  "text": {
                    "color": "{surface.700}",
                    "hoverColor": "{surface.800}",
                    "mutedColor": "{surface.500}",
                    "hoverMutedColor": "{surface.600}"
                  },
                  "content": {
                    "background": "{surface.0}",
                    "hoverBackground": "{surface.100}",
                    "borderColor": "{surface.200}",
                    "color": "{text.color}",
                    "hoverColor": "{text.hover.color}"
                  },
                  "overlay": {
                    "select": {
                      "background": "{surface.0}",
                      "borderColor": "{surface.200}",
                      "color": "{text.color}"
                    },
                    "popover": {
                      "background": "{surface.0}",
                      "borderColor": "{surface.200}",
                      "color": "{text.color}"
                    },
                    "modal": {
                      "background": "{surface.0}",
                      "borderColor": "{surface.200}",
                      "color": "{text.color}"
                    }
                  },
                  "list": {
                    "option": {
                      "focusBackground": "{surface.100}",
                      "selectedBackground": "{highlight.background}",
                      "selectedFocusBackground": "{highlight.focus.background}",
                      "color": "{text.color}",
                      "focusColor": "{text.hover.color}",
                      "selectedColor": "{highlight.color}",
                      "selectedFocusColor": "{highlight.focus.color}",
                      "icon": {
                        "color": "{surface.400}",
                        "focusColor": "{surface.500}"
                      }
                    },
                    "optionGroup": {
                      "background": "transparent",
                      "color": "{text.muted.color}"
                    }
                  },
                  "navigation": {
                    "item": {
                      "focusBackground": "{surface.100}",
                      "activeBackground": "{surface.100}",
                      "color": "{text.color}",
                      "focusColor": "{text.hover.color}",
                      "activeColor": "{text.hover.color}",
                      "icon": {
                        "color": "{surface.400}",
                        "focusColor": "{surface.500}",
                        "activeColor": "{surface.500}"
                      }
                    },
                    "submenuLabel": {
                      "background": "transparent",
                      "color": "{text.muted.color}"
                    },
                    "submenuIcon": {
                      "color": "{surface.400}",
                      "focusColor": "{surface.500}",
                      "activeColor": "{surface.500}"
                    }
                  }
                },
                "dark": {
                  "surface": {
                    "0": "#ffffff",
                    "50": "{zinc.50}",
                    "100": "{zinc.100}",
                    "200": "{zinc.200}",
                    "300": "{zinc.300}",
                    "400": "{zinc.400}",
                    "500": "{zinc.500}",
                    "600": "{zinc.600}",
                    "700": "{zinc.700}",
                    "800": "{zinc.800}",
                    "900": "{zinc.900}",
                    "950": "{zinc.950}"
                  },
                  "primary": {
                    "color": "{primary.400}",
                    "contrastColor": "{surface.900}",
                    "hoverColor": "{primary.300}",
                    "activeColor": "{primary.200}"
                  },
                  "highlight": {
                    "background": "color-mix(in srgb, {primary.400}, transparent 84%)",
                    "focusBackground": "color-mix(in srgb, {primary.400}, transparent 76%)",
                    "color": "rgba(255,255,255,.87)",
                    "focusColor": "rgba(255,255,255,.87)"
                  },
                  "mask": {
                    "background": "rgba(0,0,0,0.6)",
                    "color": "{surface.200}"
                  },
                  "formField": {
                    "background": "{surface.950}",
                    "disabledBackground": "{surface.700}",
                    "filledBackground": "{surface.800}",
                    "filledFocusBackground": "{surface.800}",
                    "borderColor": "{surface.700}",
                    "hoverBorderColor": "{surface.600}",
                    "focusBorderColor": "{primary.color}",
                    "invalidBorderColor": "{red.300}",
                    "color": "{surface.0}",
                    "disabledColor": "{surface.400}",
                    "placeholderColor": "{surface.400}",
                    "floatLabelColor": "{surface.400}",
                    "floatLabelFocusColor": "{surface.400}",
                    "floatLabelInvalidColor": "{red.300}",
                    "iconColor": "{surface.400}",
                    "shadow": "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgba(18, 18, 23, 0.05)"
                  },
                  "text": {
                    "color": "{surface.0}",
                    "hoverColor": "{surface.0}",
                    "mutedColor": "{surface.400}",
                    "hoverMutedColor": "{surface.300}"
                  },
                  "content": {
                    "background": "{surface.900}",
                    "hoverBackground": "{surface.800}",
                    "borderColor": "{surface.700}",
                    "color": "{text.color}",
                    "hoverColor": "{text.hover.color}"
                  },
                  "overlay": {
                    "select": {
                      "background": "{surface.900}",
                      "borderColor": "{surface.700}",
                      "color": "{text.color}"
                    },
                    "popover": {
                      "background": "{surface.900}",
                      "borderColor": "{surface.700}",
                      "color": "{text.color}"
                    },
                    "modal": {
                      "background": "{surface.900}",
                      "borderColor": "{surface.700}",
                      "color": "{text.color}"
                    }
                  },
                  "list": {
                    "option": {
                      "focusBackground": "{surface.800}",
                      "selectedBackground": "{highlight.background}",
                      "selectedFocusBackground": "{highlight.focus.background}",
                      "color": "{text.color}",
                      "focusColor": "{text.hover.color}",
                      "selectedColor": "{highlight.color}",
                      "selectedFocusColor": "{highlight.focus.color}",
                      "icon": {
                        "color": "{surface.500}",
                        "focusColor": "{surface.400}"
                      }
                    },
                    "optionGroup": {
                      "background": "transparent",
                      "color": "{text.muted.color}"
                    }
                  },
                  "navigation": {
                    "item": {
                      "focusBackground": "{surface.800}",
                      "activeBackground": "{surface.800}",
                      "color": "{text.color}",
                      "focusColor": "{text.hover.color}",
                      "activeColor": "{text.hover.color}",
                      "icon": {
                        "color": "{surface.500}",
                        "focusColor": "{surface.400}",
                        "activeColor": "{surface.400}"
                      }
                    },
                    "submenuLabel": {
                      "background": "transparent",
                      "color": "{text.muted.color}"
                    },
                    "submenuIcon": {
                      "color": "{surface.500}",
                      "focusColor": "{surface.400}",
                      "activeColor": "{surface.400}"
                    }
                  }
                }
              }
            },
            "components": {
              "accordion": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "panel": {
                  "borderWidth": "0 0 1px 0",
                  "borderColor": "{content.border.color}"
                },
                "header": {
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "activeColor": "{text.color}",
                  "padding": "1.125rem",
                  "fontWeight": "600",
                  "borderRadius": "0",
                  "borderWidth": "0",
                  "borderColor": "{content.border.color}",
                  "background": "{content.background}",
                  "hoverBackground": "{content.background}",
                  "activeBackground": "{content.background}",
                  "activeHoverBackground": "{content.background}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  },
                  "toggleIcon": {
                    "color": "{text.muted.color}",
                    "hoverColor": "{text.color}",
                    "activeColor": "{text.color}",
                    "activeHoverColor": "{text.color}"
                  },
                  "first": {
                    "topBorderRadius": "{content.border.radius}",
                    "borderWidth": "0"
                  },
                  "last": {
                    "bottomBorderRadius": "{content.border.radius}",
                    "activeBottomBorderRadius": "0"
                  }
                },
                "content": {
                  "borderWidth": "0",
                  "borderColor": "{content.border.color}",
                  "background": "{content.background}",
                  "color": "{text.color}",
                  "padding": "0 1.125rem 1.125rem 1.125rem"
                }
              },
              "autocomplete": {
                "root": {
                  "background": "{form.field.background}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "filledBackground": "{form.field.filled.background}",
                  "filledFocusBackground": "{form.field.filled.focus.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.focus.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "color": "{form.field.color}",
                  "disabledColor": "{form.field.disabled.color}",
                  "placeholderColor": "{form.field.placeholder.color}",
                  "shadow": "{form.field.shadow}",
                  "paddingX": "{form.field.padding.x}",
                  "paddingY": "{form.field.padding.y}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{form.field.focus.ring.width}",
                    "style": "{form.field.focus.ring.style}",
                    "color": "{form.field.focus.ring.color}",
                    "offset": "{form.field.focus.ring.offset}",
                    "shadow": "{form.field.focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "overlay": {
                  "background": "{overlay.select.background}",
                  "borderColor": "{overlay.select.border.color}",
                  "borderRadius": "{overlay.select.border.radius}",
                  "color": "{overlay.select.color}",
                  "shadow": "{overlay.select.shadow}"
                },
                "list": {
                  "padding": "{list.padding}",
                  "gap": "{list.gap}"
                },
                "option": {
                  "focusBackground": "{list.option.focus.background}",
                  "selectedBackground": "{list.option.selected.background}",
                  "selectedFocusBackground": "{list.option.selected.focus.background}",
                  "color": "{list.option.color}",
                  "focusColor": "{list.option.focus.color}",
                  "selectedColor": "{list.option.selected.color}",
                  "selectedFocusColor": "{list.option.selected.focus.color}",
                  "padding": "{list.option.padding}",
                  "borderRadius": "{list.option.border.radius}"
                },
                "optionGroup": {
                  "background": "{list.option.group.background}",
                  "color": "{list.option.group.color}",
                  "fontWeight": "{list.option.group.font.weight}",
                  "padding": "{list.option.group.padding}"
                },
                "dropdown": {
                  "width": "2.5rem",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.border.color}",
                  "activeBorderColor": "{form.field.border.color}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "chip": {
                  "borderRadius": "{border.radius.sm}"
                },
                "emptyMessage": {
                  "padding": "{list.option.padding}"
                },
                "colorScheme": {
                  "light": {
                    "dropdown": {
                      "background": "{surface.100}",
                      "hoverBackground": "{surface.200}",
                      "activeBackground": "{surface.300}",
                      "color": "{surface.600}",
                      "hoverColor": "{surface.700}",
                      "activeColor": "{surface.800}"
                    }
                  },
                  "dark": {
                    "dropdown": {
                      "background": "{surface.800}",
                      "hoverBackground": "{surface.700}",
                      "activeBackground": "{surface.600}",
                      "color": "{surface.300}",
                      "hoverColor": "{surface.200}",
                      "activeColor": "{surface.100}"
                    }
                  }
                }
              },
              "avatar": {
                "root": {
                  "width": "2rem",
                  "height": "2rem",
                  "fontSize": "1rem",
                  "background": "{content.border.color}",
                  "borderRadius": "{content.border.radius}"
                },
                "group": {
                  "borderColor": "{content.background}",
                  "offset": "-1rem"
                },
                "lg": {
                  "width": "3rem",
                  "height": "3rem",
                  "fontSize": "1.5rem"
                },
                "xl": {
                  "width": "4rem",
                  "height": "4rem",
                  "fontSize": "2rem"
                }
              },
              "badge": {
                "root": {
                  "borderRadius": "{border.radius.md}",
                  "padding": "0 0.5rem",
                  "fontSize": "0.75rem",
                  "fontWeight": "700",
                  "minWidth": "1.5rem",
                  "height": "1.5rem"
                },
                "dot": {
                  "size": "0.5rem"
                },
                "sm": {
                  "fontSize": "0.625rem",
                  "minWidth": "1.25rem",
                  "height": "1.25rem"
                },
                "lg": {
                  "fontSize": "0.875rem",
                  "minWidth": "1.75rem",
                  "height": "1.75rem"
                },
                "xl": {
                  "fontSize": "1rem",
                  "minWidth": "2rem",
                  "height": "2rem"
                },
                "colorScheme": {
                  "light": {
                    "primary": {
                      "background": "{primary.color}",
                      "color": "{primary.contrast.color}"
                    },
                    "secondary": {
                      "background": "{surface.100}",
                      "color": "{surface.600}"
                    },
                    "success": {
                      "background": "{green.500}",
                      "color": "{surface.0}"
                    },
                    "info": {
                      "background": "{sky.500}",
                      "color": "{surface.0}"
                    },
                    "warn": {
                      "background": "{orange.500}",
                      "color": "{surface.0}"
                    },
                    "danger": {
                      "background": "{red.500}",
                      "color": "{surface.0}"
                    },
                    "contrast": {
                      "background": "{surface.950}",
                      "color": "{surface.0}"
                    }
                  },
                  "dark": {
                    "primary": {
                      "background": "{primary.color}",
                      "color": "{primary.contrast.color}"
                    },
                    "secondary": {
                      "background": "{surface.800}",
                      "color": "{surface.300}"
                    },
                    "success": {
                      "background": "{green.400}",
                      "color": "{green.950}"
                    },
                    "info": {
                      "background": "{sky.400}",
                      "color": "{sky.950}"
                    },
                    "warn": {
                      "background": "{orange.400}",
                      "color": "{orange.950}"
                    },
                    "danger": {
                      "background": "{red.400}",
                      "color": "{red.950}"
                    },
                    "contrast": {
                      "background": "{surface.0}",
                      "color": "{surface.950}"
                    }
                  }
                }
              },
              "blockui": {
                "root": {
                  "borderRadius": "{content.border.radius}"
                }
              },
              "breadcrumb": {
                "root": {
                  "padding": "1rem",
                  "background": "{content.background}",
                  "gap": "0.5rem",
                  "transitionDuration": "{transition.duration}"
                },
                "item": {
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "borderRadius": "{content.border.radius}",
                  "gap": "{navigation.item.gap}",
                  "icon": {
                    "color": "{navigation.item.icon.color}",
                    "hoverColor": "{navigation.item.icon.focus.color}"
                  },
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "separator": {
                  "color": "{navigation.item.icon.color}"
                }
              },
              "button": {
                "root": {
                  "borderRadius": "{form.field.border.radius}",
                  "roundedBorderRadius": "2rem",
                  "gap": "0.5rem",
                  "paddingX": "{form.field.padding.x}",
                  "paddingY": "{form.field.padding.y}",
                  "iconOnlyWidth": "2.5rem",
                  "sm": {
                    "fontSize": "0.875rem",
                    "paddingX": "0.625rem",
                    "paddingY": "0.375rem"
                  },
                  "lg": {
                    "fontSize": "1.125rem",
                    "paddingX": "0.875rem",
                    "paddingY": "0.625rem"
                  },
                  "label": {
                    "fontWeight": "500"
                  },
                  "raisedShadow": "0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "offset": "{focus.ring.offset}"
                  },
                  "badgeSize": "1rem",
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "colorScheme": {
                  "light": {
                    "root": {
                      "primary": {
                        "background": "{primary.color}",
                        "hoverBackground": "{primary.hover.color}",
                        "activeBackground": "{primary.active.color}",
                        "borderColor": "{primary.color}",
                        "hoverBorderColor": "{primary.hover.color}",
                        "activeBorderColor": "{primary.active.color}",
                        "color": "{primary.contrast.color}",
                        "hoverColor": "{primary.contrast.color}",
                        "activeColor": "{primary.contrast.color}",
                        "focusRing": {
                          "color": "{primary.color}",
                          "shadow": "none"
                        }
                      },
                      "secondary": {
                        "background": "{surface.100}",
                        "hoverBackground": "{surface.200}",
                        "activeBackground": "{surface.300}",
                        "borderColor": "{surface.100}",
                        "hoverBorderColor": "{surface.200}",
                        "activeBorderColor": "{surface.300}",
                        "color": "{surface.600}",
                        "hoverColor": "{surface.700}",
                        "activeColor": "{surface.800}",
                        "focusRing": {
                          "color": "{surface.600}",
                          "shadow": "none"
                        }
                      },
                      "info": {
                        "background": "{sky.500}",
                        "hoverBackground": "{sky.600}",
                        "activeBackground": "{sky.700}",
                        "borderColor": "{sky.500}",
                        "hoverBorderColor": "{sky.600}",
                        "activeBorderColor": "{sky.700}",
                        "color": "#ffffff",
                        "hoverColor": "#ffffff",
                        "activeColor": "#ffffff",
                        "focusRing": {
                          "color": "{sky.500}",
                          "shadow": "none"
                        }
                      },
                      "success": {
                        "background": "{green.500}",
                        "hoverBackground": "{green.600}",
                        "activeBackground": "{green.700}",
                        "borderColor": "{green.500}",
                        "hoverBorderColor": "{green.600}",
                        "activeBorderColor": "{green.700}",
                        "color": "#ffffff",
                        "hoverColor": "#ffffff",
                        "activeColor": "#ffffff",
                        "focusRing": {
                          "color": "{green.500}",
                          "shadow": "none"
                        }
                      },
                      "warn": {
                        "background": "{orange.500}",
                        "hoverBackground": "{orange.600}",
                        "activeBackground": "{orange.700}",
                        "borderColor": "{orange.500}",
                        "hoverBorderColor": "{orange.600}",
                        "activeBorderColor": "{orange.700}",
                        "color": "#ffffff",
                        "hoverColor": "#ffffff",
                        "activeColor": "#ffffff",
                        "focusRing": {
                          "color": "{orange.500}",
                          "shadow": "none"
                        }
                      },
                      "help": {
                        "background": "{purple.500}",
                        "hoverBackground": "{purple.600}",
                        "activeBackground": "{purple.700}",
                        "borderColor": "{purple.500}",
                        "hoverBorderColor": "{purple.600}",
                        "activeBorderColor": "{purple.700}",
                        "color": "#ffffff",
                        "hoverColor": "#ffffff",
                        "activeColor": "#ffffff",
                        "focusRing": {
                          "color": "{purple.500}",
                          "shadow": "none"
                        }
                      },
                      "danger": {
                        "background": "{red.500}",
                        "hoverBackground": "{red.600}",
                        "activeBackground": "{red.700}",
                        "borderColor": "{red.500}",
                        "hoverBorderColor": "{red.600}",
                        "activeBorderColor": "{red.700}",
                        "color": "#ffffff",
                        "hoverColor": "#ffffff",
                        "activeColor": "#ffffff",
                        "focusRing": {
                          "color": "{red.500}",
                          "shadow": "none"
                        }
                      },
                      "contrast": {
                        "background": "{surface.950}",
                        "hoverBackground": "{surface.900}",
                        "activeBackground": "{surface.800}",
                        "borderColor": "{surface.950}",
                        "hoverBorderColor": "{surface.900}",
                        "activeBorderColor": "{surface.800}",
                        "color": "{surface.0}",
                        "hoverColor": "{surface.0}",
                        "activeColor": "{surface.0}",
                        "focusRing": {
                          "color": "{surface.950}",
                          "shadow": "none"
                        }
                      }
                    },
                    "outlined": {
                      "primary": {
                        "hoverBackground": "{primary.50}",
                        "activeBackground": "{primary.100}",
                        "borderColor": "{primary.200}",
                        "color": "{primary.color}"
                      },
                      "secondary": {
                        "hoverBackground": "{surface.50}",
                        "activeBackground": "{surface.100}",
                        "borderColor": "{surface.200}",
                        "color": "{surface.500}"
                      },
                      "success": {
                        "hoverBackground": "{green.50}",
                        "activeBackground": "{green.100}",
                        "borderColor": "{green.200}",
                        "color": "{green.500}"
                      },
                      "info": {
                        "hoverBackground": "{sky.50}",
                        "activeBackground": "{sky.100}",
                        "borderColor": "{sky.200}",
                        "color": "{sky.500}"
                      },
                      "warn": {
                        "hoverBackground": "{orange.50}",
                        "activeBackground": "{orange.100}",
                        "borderColor": "{orange.200}",
                        "color": "{orange.500}"
                      },
                      "help": {
                        "hoverBackground": "{purple.50}",
                        "activeBackground": "{purple.100}",
                        "borderColor": "{purple.200}",
                        "color": "{purple.500}"
                      },
                      "danger": {
                        "hoverBackground": "{red.50}",
                        "activeBackground": "{red.100}",
                        "borderColor": "{red.200}",
                        "color": "{red.500}"
                      },
                      "contrast": {
                        "hoverBackground": "{surface.50}",
                        "activeBackground": "{surface.100}",
                        "borderColor": "{surface.700}",
                        "color": "{surface.950}"
                      },
                      "plain": {
                        "hoverBackground": "{surface.50}",
                        "activeBackground": "{surface.100}",
                        "borderColor": "{surface.200}",
                        "color": "{surface.700}"
                      }
                    },
                    "text": {
                      "primary": {
                        "hoverBackground": "{primary.50}",
                        "activeBackground": "{primary.100}",
                        "color": "{primary.color}"
                      },
                      "secondary": {
                        "hoverBackground": "{surface.50}",
                        "activeBackground": "{surface.100}",
                        "color": "{surface.500}"
                      },
                      "success": {
                        "hoverBackground": "{green.50}",
                        "activeBackground": "{green.100}",
                        "color": "{green.500}"
                      },
                      "info": {
                        "hoverBackground": "{sky.50}",
                        "activeBackground": "{sky.100}",
                        "color": "{sky.500}"
                      },
                      "warn": {
                        "hoverBackground": "{orange.50}",
                        "activeBackground": "{orange.100}",
                        "color": "{orange.500}"
                      },
                      "help": {
                        "hoverBackground": "{purple.50}",
                        "activeBackground": "{purple.100}",
                        "color": "{purple.500}"
                      },
                      "danger": {
                        "hoverBackground": "{red.50}",
                        "activeBackground": "{red.100}",
                        "color": "{red.500}"
                      },
                      "plain": {
                        "hoverBackground": "{surface.50}",
                        "activeBackground": "{surface.100}",
                        "color": "{surface.700}"
                      }
                    },
                    "link": {
                      "color": "{primary.color}",
                      "hoverColor": "{primary.color}",
                      "activeColor": "{primary.color}"
                    }
                  },
                  "dark": {
                    "root": {
                      "primary": {
                        "background": "{primary.color}",
                        "hoverBackground": "{primary.hover.color}",
                        "activeBackground": "{primary.active.color}",
                        "borderColor": "{primary.color}",
                        "hoverBorderColor": "{primary.hover.color}",
                        "activeBorderColor": "{primary.active.color}",
                        "color": "{primary.contrast.color}",
                        "hoverColor": "{primary.contrast.color}",
                        "activeColor": "{primary.contrast.color}",
                        "focusRing": {
                          "color": "{primary.color}",
                          "shadow": "none"
                        }
                      },
                      "secondary": {
                        "background": "{surface.800}",
                        "hoverBackground": "{surface.700}",
                        "activeBackground": "{surface.600}",
                        "borderColor": "{surface.800}",
                        "hoverBorderColor": "{surface.700}",
                        "activeBorderColor": "{surface.600}",
                        "color": "{surface.300}",
                        "hoverColor": "{surface.200}",
                        "activeColor": "{surface.100}",
                        "focusRing": {
                          "color": "{surface.300}",
                          "shadow": "none"
                        }
                      },
                      "info": {
                        "background": "{sky.400}",
                        "hoverBackground": "{sky.300}",
                        "activeBackground": "{sky.200}",
                        "borderColor": "{sky.400}",
                        "hoverBorderColor": "{sky.300}",
                        "activeBorderColor": "{sky.200}",
                        "color": "{sky.950}",
                        "hoverColor": "{sky.950}",
                        "activeColor": "{sky.950}",
                        "focusRing": {
                          "color": "{sky.400}",
                          "shadow": "none"
                        }
                      },
                      "success": {
                        "background": "{green.400}",
                        "hoverBackground": "{green.300}",
                        "activeBackground": "{green.200}",
                        "borderColor": "{green.400}",
                        "hoverBorderColor": "{green.300}",
                        "activeBorderColor": "{green.200}",
                        "color": "{green.950}",
                        "hoverColor": "{green.950}",
                        "activeColor": "{green.950}",
                        "focusRing": {
                          "color": "{green.400}",
                          "shadow": "none"
                        }
                      },
                      "warn": {
                        "background": "{orange.400}",
                        "hoverBackground": "{orange.300}",
                        "activeBackground": "{orange.200}",
                        "borderColor": "{orange.400}",
                        "hoverBorderColor": "{orange.300}",
                        "activeBorderColor": "{orange.200}",
                        "color": "{orange.950}",
                        "hoverColor": "{orange.950}",
                        "activeColor": "{orange.950}",
                        "focusRing": {
                          "color": "{orange.400}",
                          "shadow": "none"
                        }
                      },
                      "help": {
                        "background": "{purple.400}",
                        "hoverBackground": "{purple.300}",
                        "activeBackground": "{purple.200}",
                        "borderColor": "{purple.400}",
                        "hoverBorderColor": "{purple.300}",
                        "activeBorderColor": "{purple.200}",
                        "color": "{purple.950}",
                        "hoverColor": "{purple.950}",
                        "activeColor": "{purple.950}",
                        "focusRing": {
                          "color": "{purple.400}",
                          "shadow": "none"
                        }
                      },
                      "danger": {
                        "background": "{red.400}",
                        "hoverBackground": "{red.300}",
                        "activeBackground": "{red.200}",
                        "borderColor": "{red.400}",
                        "hoverBorderColor": "{red.300}",
                        "activeBorderColor": "{red.200}",
                        "color": "{red.950}",
                        "hoverColor": "{red.950}",
                        "activeColor": "{red.950}",
                        "focusRing": {
                          "color": "{red.400}",
                          "shadow": "none"
                        }
                      },
                      "contrast": {
                        "background": "{surface.0}",
                        "hoverBackground": "{surface.100}",
                        "activeBackground": "{surface.200}",
                        "borderColor": "{surface.0}",
                        "hoverBorderColor": "{surface.100}",
                        "activeBorderColor": "{surface.200}",
                        "color": "{surface.950}",
                        "hoverColor": "{surface.950}",
                        "activeColor": "{surface.950}",
                        "focusRing": {
                          "color": "{surface.0}",
                          "shadow": "none"
                        }
                      }
                    },
                    "outlined": {
                      "primary": {
                        "hoverBackground": "color-mix(in srgb, {primary.color}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {primary.color}, transparent 84%)",
                        "borderColor": "{primary.700}",
                        "color": "{primary.color}"
                      },
                      "secondary": {
                        "hoverBackground": "rgba(255,255,255,0.04)",
                        "activeBackground": "rgba(255,255,255,0.16)",
                        "borderColor": "{surface.700}",
                        "color": "{surface.400}"
                      },
                      "success": {
                        "hoverBackground": "color-mix(in srgb, {green.400}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {green.400}, transparent 84%)",
                        "borderColor": "{green.700}",
                        "color": "{green.400}"
                      },
                      "info": {
                        "hoverBackground": "color-mix(in srgb, {sky.400}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {sky.400}, transparent 84%)",
                        "borderColor": "{sky.700}",
                        "color": "{sky.400}"
                      },
                      "warn": {
                        "hoverBackground": "color-mix(in srgb, {orange.400}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {orange.400}, transparent 84%)",
                        "borderColor": "{orange.700}",
                        "color": "{orange.400}"
                      },
                      "help": {
                        "hoverBackground": "color-mix(in srgb, {purple.400}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {purple.400}, transparent 84%)",
                        "borderColor": "{purple.700}",
                        "color": "{purple.400}"
                      },
                      "danger": {
                        "hoverBackground": "color-mix(in srgb, {red.400}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {red.400}, transparent 84%)",
                        "borderColor": "{red.700}",
                        "color": "{red.400}"
                      },
                      "contrast": {
                        "hoverBackground": "{surface.800}",
                        "activeBackground": "{surface.700}",
                        "borderColor": "{surface.500}",
                        "color": "{surface.0}"
                      },
                      "plain": {
                        "hoverBackground": "{surface.800}",
                        "activeBackground": "{surface.700}",
                        "borderColor": "{surface.600}",
                        "color": "{surface.0}"
                      }
                    },
                    "text": {
                      "primary": {
                        "hoverBackground": "color-mix(in srgb, {primary.color}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {primary.color}, transparent 84%)",
                        "color": "{primary.color}"
                      },
                      "secondary": {
                        "hoverBackground": "{surface.800}",
                        "activeBackground": "{surface.700}",
                        "color": "{surface.400}"
                      },
                      "success": {
                        "hoverBackground": "color-mix(in srgb, {green.400}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {green.400}, transparent 84%)",
                        "color": "{green.400}"
                      },
                      "info": {
                        "hoverBackground": "color-mix(in srgb, {sky.400}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {sky.400}, transparent 84%)",
                        "color": "{sky.400}"
                      },
                      "warn": {
                        "hoverBackground": "color-mix(in srgb, {orange.400}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {orange.400}, transparent 84%)",
                        "color": "{orange.400}"
                      },
                      "help": {
                        "hoverBackground": "color-mix(in srgb, {purple.400}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {purple.400}, transparent 84%)",
                        "color": "{purple.400}"
                      },
                      "danger": {
                        "hoverBackground": "color-mix(in srgb, {red.400}, transparent 96%)",
                        "activeBackground": "color-mix(in srgb, {red.400}, transparent 84%)",
                        "color": "{red.400}"
                      },
                      "plain": {
                        "hoverBackground": "{surface.800}",
                        "activeBackground": "{surface.700}",
                        "color": "{surface.0}"
                      }
                    },
                    "link": {
                      "color": "{primary.color}",
                      "hoverColor": "{primary.color}",
                      "activeColor": "{primary.color}"
                    }
                  }
                }
              },
              "datepicker": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "panel": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{content.color}",
                  "borderRadius": "{content.border.radius}",
                  "shadow": "{overlay.popover.shadow}",
                  "padding": "{overlay.popover.padding}"
                },
                "header": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{content.color}",
                  "padding": "0 0 0.5rem 0",
                  "fontWeight": "500",
                  "gap": "0.5rem"
                },
                "title": {
                  "gap": "0.5rem",
                  "fontWeight": "500"
                },
                "dropdown": {
                  "width": "2.5rem",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.border.color}",
                  "activeBorderColor": "{form.field.border.color}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "inputIcon": {
                  "color": "{form.field.icon.color}"
                },
                "selectMonth": {
                  "hoverBackground": "{content.hover.background}",
                  "color": "{content.color}",
                  "hoverColor": "{content.hover.color}",
                  "padding": "0.25rem 0.5rem",
                  "borderRadius": "{content.border.radius}"
                },
                "selectYear": {
                  "hoverBackground": "{content.hover.background}",
                  "color": "{content.color}",
                  "hoverColor": "{content.hover.color}",
                  "padding": "0.25rem 0.5rem",
                  "borderRadius": "{content.border.radius}"
                },
                "group": {
                  "borderColor": "{content.border.color}",
                  "gap": "{overlay.popover.padding}"
                },
                "dayView": {
                  "margin": "0.5rem 0 0 0"
                },
                "weekDay": {
                  "padding": "0.25rem",
                  "fontWeight": "500",
                  "color": "{content.color}"
                },
                "date": {
                  "hoverBackground": "{content.hover.background}",
                  "selectedBackground": "{primary.color}",
                  "rangeSelectedBackground": "{highlight.background}",
                  "color": "{content.color}",
                  "hoverColor": "{content.hover.color}",
                  "selectedColor": "{primary.contrast.color}",
                  "rangeSelectedColor": "{highlight.color}",
                  "width": "2rem",
                  "height": "2rem",
                  "borderRadius": "50%",
                  "padding": "0.25rem",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "monthView": {
                  "margin": "0.5rem 0 0 0"
                },
                "month": {
                  "borderRadius": "{content.border.radius}"
                },
                "yearView": {
                  "margin": "0.5rem 0 0 0"
                },
                "year": {
                  "borderRadius": "{content.border.radius}"
                },
                "buttonbar": {
                  "padding": "0.5rem 0 0 0",
                  "borderColor": "{content.border.color}"
                },
                "timePicker": {
                  "padding": "0.5rem 0 0 0",
                  "borderColor": "{content.border.color}",
                  "gap": "0.5rem",
                  "buttonGap": "0.25rem"
                },
                "colorScheme": {
                  "light": {
                    "dropdown": {
                      "background": "{surface.100}",
                      "hoverBackground": "{surface.200}",
                      "activeBackground": "{surface.300}",
                      "color": "{surface.600}",
                      "hoverColor": "{surface.700}",
                      "activeColor": "{surface.800}"
                    },
                    "today": {
                      "background": "{surface.200}",
                      "color": "{surface.900}"
                    }
                  },
                  "dark": {
                    "dropdown": {
                      "background": "{surface.800}",
                      "hoverBackground": "{surface.700}",
                      "activeBackground": "{surface.600}",
                      "color": "{surface.300}",
                      "hoverColor": "{surface.200}",
                      "activeColor": "{surface.100}"
                    },
                    "today": {
                      "background": "{surface.700}",
                      "color": "{surface.0}"
                    }
                  }
                }
              },
              "card": {
                "root": {
                  "background": "{content.background}",
                  "borderRadius": "{border.radius.xl}",
                  "color": "{content.color}",
                  "shadow": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"
                },
                "body": {
                  "padding": "1.25rem",
                  "gap": "0.5rem"
                },
                "caption": {
                  "gap": "0.5rem"
                },
                "title": {
                  "fontSize": "1.25rem",
                  "fontWeight": "500"
                },
                "subtitle": {
                  "color": "{text.muted.color}"
                }
              },
              "carousel": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "content": {
                  "gap": "0.25rem"
                },
                "indicatorList": {
                  "padding": "1rem",
                  "gap": "0.5rem"
                },
                "indicator": {
                  "width": "2rem",
                  "height": "0.5rem",
                  "borderRadius": "{content.border.radius}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "colorScheme": {
                  "light": {
                    "indicator": {
                      "background": "{surface.200}",
                      "hoverBackground": "{surface.300}",
                      "activeBackground": "{primary.color}"
                    }
                  },
                  "dark": {
                    "indicator": {
                      "background": "{surface.700}",
                      "hoverBackground": "{surface.600}",
                      "activeBackground": "{primary.color}"
                    }
                  }
                }
              },
              "cascadeselect": {
                "root": {
                  "background": "{form.field.background}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "filledBackground": "{form.field.filled.background}",
                  "filledFocusBackground": "{form.field.filled.focus.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.focus.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "color": "{form.field.color}",
                  "disabledColor": "{form.field.disabled.color}",
                  "placeholderColor": "{form.field.placeholder.color}",
                  "shadow": "{form.field.shadow}",
                  "paddingX": "{form.field.padding.x}",
                  "paddingY": "{form.field.padding.y}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{form.field.focus.ring.width}",
                    "style": "{form.field.focus.ring.style}",
                    "color": "{form.field.focus.ring.color}",
                    "offset": "{form.field.focus.ring.offset}",
                    "shadow": "{form.field.focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "dropdown": {
                  "width": "2.5rem",
                  "color": "{form.field.icon.color}"
                },
                "overlay": {
                  "background": "{overlay.select.background}",
                  "borderColor": "{overlay.select.border.color}",
                  "borderRadius": "{overlay.select.border.radius}",
                  "color": "{overlay.select.color}",
                  "shadow": "{overlay.select.shadow}"
                },
                "list": {
                  "padding": "{list.padding}",
                  "gap": "{list.gap}"
                },
                "option": {
                  "focusBackground": "{list.option.focus.background}",
                  "selectedBackground": "{list.option.selected.background}",
                  "selectedFocusBackground": "{list.option.selected.focus.background}",
                  "color": "{list.option.color}",
                  "focusColor": "{list.option.focus.color}",
                  "selectedColor": "{list.option.selected.color}",
                  "selectedFocusColor": "{list.option.selected.focus.color}",
                  "padding": "{list.option.padding}",
                  "borderRadius": "{list.option.border.radius}",
                  "icon": {
                    "color": "{list.option.icon.color}",
                    "focusColor": "{list.option.icon.focus.color}",
                    "size": "0.875rem"
                  }
                }
              },
              "checkbox": {
                "root": {
                  "borderRadius": "{border.radius.sm}",
                  "width": "1.25rem",
                  "height": "1.25rem",
                  "background": "{form.field.background}",
                  "checkedBackground": "{primary.color}",
                  "checkedHoverBackground": "{primary.hover.color}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "filledBackground": "{form.field.filled.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.border.color}",
                  "checkedBorderColor": "{primary.color}",
                  "checkedHoverBorderColor": "{primary.hover.color}",
                  "checkedFocusBorderColor": "{primary.color}",
                  "checkedDisabledBorderColor": "{form.field.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "shadow": "{form.field.shadow}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "icon": {
                  "size": "0.875rem",
                  "color": "{form.field.color}",
                  "checkedColor": "{primary.contrast.color}",
                  "checkedHoverColor": "{primary.contrast.color}",
                  "disabledColor": "{form.field.disabled.color}"
                }
              },
              "chip": {
                "root": {
                  "borderRadius": "16px",
                  "paddingX": "0.75rem",
                  "paddingY": "0.5rem",
                  "gap": "0.5rem",
                  "transitionDuration": "{transition.duration}"
                },
                "image": {
                  "width": "2rem",
                  "height": "2rem"
                },
                "icon": {
                  "size": "1rem"
                },
                "removeIcon": {
                  "size": "1rem",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{form.field.focus.ring.shadow}"
                  }
                },
                "colorScheme": {
                  "light": {
                    "root": {
                      "background": "{surface.100}",
                      "color": "{surface.800}"
                    },
                    "icon": {
                      "color": "{surface.800}"
                    },
                    "removeIcon": {
                      "color": "{surface.800}"
                    }
                  },
                  "dark": {
                    "root": {
                      "background": "{surface.800}",
                      "color": "{surface.0}"
                    },
                    "icon": {
                      "color": "{surface.0}"
                    },
                    "removeIcon": {
                      "color": "{surface.0}"
                    }
                  }
                }
              },
              "colorpicker": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "preview": {
                  "width": "1.5rem",
                  "height": "1.5rem",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "panel": {
                  "shadow": "{overlay.popover.shadow}",
                  "borderRadius": "{overlay.popover.borderRadius}"
                },
                "colorScheme": {
                  "light": {
                    "panel": {
                      "background": "{surface.800}",
                      "borderColor": "{surface.900}"
                    },
                    "handle": {
                      "color": "{surface.0}"
                    }
                  },
                  "dark": {
                    "panel": {
                      "background": "{surface.900}",
                      "borderColor": "{surface.700}"
                    },
                    "handle": {
                      "color": "{surface.0}"
                    }
                  }
                }
              },
              "confirmdialog": {
                "icon": {
                  "size": "2rem",
                  "color": "{overlay.modal.color}"
                },
                "content": {
                  "gap": "1rem"
                }
              },
              "confirmpopup": {
                "root": {
                  "background": "{overlay.popover.background}",
                  "borderColor": "{overlay.popover.border.color}",
                  "color": "{overlay.popover.color}",
                  "borderRadius": "{overlay.popover.border.radius}",
                  "shadow": "{overlay.popover.shadow}",
                  "gutter": "10px",
                  "arrowOffset": "1.25rem"
                },
                "content": {
                  "padding": "{overlay.popover.padding}",
                  "gap": "1rem"
                },
                "icon": {
                  "size": "1.5rem",
                  "color": "{overlay.popover.color}"
                },
                "footer": {
                  "gap": "0.5rem",
                  "padding": "0 {overlay.popover.padding} {overlay.popover.padding} {overlay.popover.padding}"
                }
              },
              "contextmenu": {
                "root": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{content.color}",
                  "borderRadius": "{content.border.radius}",
                  "shadow": "{overlay.navigation.shadow}",
                  "transitionDuration": "{transition.duration}"
                },
                "list": {
                  "padding": "{navigation.list.padding}",
                  "gap": "{navigation.list.gap}"
                },
                "item": {
                  "focusBackground": "{navigation.item.focus.background}",
                  "activeBackground": "{navigation.item.active.background}",
                  "color": "{navigation.item.color}",
                  "focusColor": "{navigation.item.focus.color}",
                  "activeColor": "{navigation.item.active.color}",
                  "padding": "{navigation.item.padding}",
                  "borderRadius": "{navigation.item.border.radius}",
                  "gap": "{navigation.item.gap}",
                  "icon": {
                    "color": "{navigation.item.icon.color}",
                    "focusColor": "{navigation.item.icon.focus.color}",
                    "activeColor": "{navigation.item.icon.active.color}"
                  }
                },
                "submenuIcon": {
                  "size": "{navigation.submenu.icon.size}",
                  "color": "{navigation.submenu.icon.color}",
                  "focusColor": "{navigation.submenu.icon.focus.color}",
                  "activeColor": "{navigation.submenu.icon.active.color}"
                },
                "separator": {
                  "borderColor": "{content.border.color}"
                }
              },
              "dataview": {
                "root": {
                  "borderColor": "transparent",
                  "borderWidth": "0",
                  "borderRadius": "0",
                  "padding": "0"
                },
                "header": {
                  "background": "{content.background}",
                  "color": "{content.color}",
                  "borderColor": "{content.border.color}",
                  "borderWidth": "0 0 1px 0",
                  "padding": "0.75rem 1rem",
                  "borderRadius": "0"
                },
                "content": {
                  "background": "{content.background}",
                  "color": "{content.color}",
                  "borderColor": "transparent",
                  "borderWidth": "0",
                  "padding": "0",
                  "borderRadius": "0"
                },
                "footer": {
                  "background": "{content.background}",
                  "color": "{content.color}",
                  "borderColor": "{content.border.color}",
                  "borderWidth": "1px 0 0 0",
                  "padding": "0.75rem 1rem",
                  "borderRadius": "0"
                },
                "paginatorTop": {
                  "borderColor": "{content.border.color}",
                  "borderWidth": "0 0 1px 0"
                },
                "paginatorBottom": {
                  "borderColor": "{content.border.color}",
                  "borderWidth": "1px 0 0 0"
                }
              },
              "datatable": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "header": {
                  "background": "{content.background}",
                  "borderColor": "{datatable.border.color}",
                  "color": "{content.color}",
                  "borderWidth": "0 0 1px 0",
                  "padding": "0.75rem 1rem"
                },
                "headerCell": {
                  "background": "{content.background}",
                  "hoverBackground": "{content.hover.background}",
                  "selectedBackground": "{highlight.background}",
                  "borderColor": "{datatable.border.color}",
                  "color": "{content.color}",
                  "hoverColor": "{content.hover.color}",
                  "selectedColor": "{highlight.color}",
                  "gap": "0.5rem",
                  "padding": "0.75rem 1rem",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "-1px",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "columnTitle": {
                  "fontWeight": "600"
                },
                "row": {
                  "background": "{content.background}",
                  "hoverBackground": "{content.hover.background}",
                  "selectedBackground": "{highlight.background}",
                  "color": "{content.color}",
                  "hoverColor": "{content.hover.color}",
                  "selectedColor": "{highlight.color}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "-1px",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "bodyCell": {
                  "borderColor": "{datatable.border.color}",
                  "padding": "0.75rem 1rem"
                },
                "footerCell": {
                  "background": "{content.background}",
                  "borderColor": "{datatable.border.color}",
                  "color": "{content.color}",
                  "padding": "0.75rem 1rem"
                },
                "columnFooter": {
                  "fontWeight": "600"
                },
                "footer": {
                  "background": "{content.background}",
                  "borderColor": "{datatable.border.color}",
                  "color": "{content.color}",
                  "borderWidth": "0 0 1px 0",
                  "padding": "0.75rem 1rem"
                },
                "dropPointColor": "{primary.color}",
                "columnResizerWidth": "0.5rem",
                "resizeIndicator": {
                  "width": "1px",
                  "color": "{primary.color}"
                },
                "sortIcon": {
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.hover.muted.color}"
                },
                "loadingIcon": {
                  "size": "2rem"
                },
                "rowToggleButton": {
                  "hoverBackground": "{content.hover.background}",
                  "selectedHoverBackground": "{content.background}",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "selectedHoverColor": "{primary.color}",
                  "size": "1.75rem",
                  "borderRadius": "50%",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "filter": {
                  "inlineGap": "0.5rem",
                  "overlaySelect": {
                    "background": "{overlay.select.background}",
                    "borderColor": "{overlay.select.border.color}",
                    "borderRadius": "{overlay.select.border.radius}",
                    "color": "{overlay.select.color}",
                    "shadow": "{overlay.select.shadow}"
                  },
                  "overlayPopover": {
                    "background": "{overlay.popover.background}",
                    "borderColor": "{overlay.popover.border.color}",
                    "borderRadius": "{overlay.popover.border.radius}",
                    "color": "{overlay.popover.color}",
                    "shadow": "{overlay.popover.shadow}",
                    "padding": "{overlay.popover.padding}",
                    "gap": "0.5rem"
                  },
                  "rule": {
                    "borderColor": "{content.border.color}"
                  },
                  "constraintList": {
                    "padding": "{list.padding}",
                    "gap": "{list.gap}"
                  },
                  "constraint": {
                    "focusBackground": "{list.option.focus.background}",
                    "selectedBackground": "{list.option.selected.background}",
                    "selectedFocusBackground": "{list.option.selected.focus.background}",
                    "color": "{list.option.color}",
                    "focusColor": "{list.option.focus.color}",
                    "selectedColor": "{list.option.selected.color}",
                    "selectedFocusColor": "{list.option.selected.focus.color}",
                    "separator": {
                      "borderColor": "{content.border.color}"
                    },
                    "padding": "{list.option.padding}",
                    "borderRadius": "{list.option.border.radius}"
                  }
                },
                "paginatorTop": {
                  "borderColor": "{datatable.border.color}",
                  "borderWidth": "0 0 1px 0"
                },
                "paginatorBottom": {
                  "borderColor": "{datatable.border.color}",
                  "borderWidth": "0 0 1px 0"
                },
                "colorScheme": {
                  "light": {
                    "root": {
                      "borderColor": "{content.border.color}"
                    },
                    "row": {
                      "stripedBackground": "{surface.50}"
                    },
                    "bodyCell": {
                      "selectedBorderColor": "{primary.100}"
                    }
                  },
                  "dark": {
                    "root": {
                      "borderColor": "{surface.800}"
                    },
                    "row": {
                      "stripedBackground": "{surface.950}"
                    },
                    "bodyCell": {
                      "selectedBorderColor": "{primary.900}"
                    }
                  }
                }
              },
              "dialog": {
                "root": {
                  "background": "{overlay.modal.background}",
                  "borderColor": "{overlay.modal.border.color}",
                  "color": "{overlay.modal.color}",
                  "borderRadius": "{overlay.modal.border.radius}",
                  "shadow": "{overlay.modal.shadow}"
                },
                "header": {
                  "padding": "{overlay.modal.padding}",
                  "gap": "0.5rem"
                },
                "title": {
                  "fontSize": "1.25rem",
                  "fontWeight": "600"
                },
                "content": {
                  "padding": "0 {overlay.modal.padding} {overlay.modal.padding} {overlay.modal.padding}"
                },
                "footer": {
                  "padding": "0 {overlay.modal.padding} {overlay.modal.padding} {overlay.modal.padding}",
                  "gap": "0.5rem"
                }
              },
              "divider": {
                "root": {
                  "borderColor": "{content.border.color}"
                },
                "content": {
                  "background": "{content.background}",
                  "color": "{text.color}"
                },
                "horizontal": {
                  "margin": "1rem 0",
                  "padding": "0 1rem",
                  "content": {
                    "padding": "0 0.5rem"
                  }
                },
                "vertical": {
                  "margin": "0 1rem",
                  "padding": "0.5rem 0",
                  "content": {
                    "padding": "0.5rem 0"
                  }
                }
              },
              "dock": {
                "root": {
                  "background": "rgba(255, 255, 255, 0.1)",
                  "borderColor": "rgba(255, 255, 255, 0.2)",
                  "padding": "0.5rem",
                  "borderRadius": "{border.radius.xl}"
                },
                "item": {
                  "borderRadius": "{content.border.radius}",
                  "padding": "0.5rem",
                  "size": "3rem",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                }
              },
              "drawer": {
                "root": {
                  "background": "{overlay.modal.background}",
                  "borderColor": "{overlay.modal.border.color}",
                  "color": "{overlay.modal.color}",
                  "borderRadius": "{overlay.modal.border.radius}",
                  "shadow": "{overlay.modal.shadow}"
                },
                "header": {
                  "padding": "{overlay.modal.padding}"
                },
                "title": {
                  "fontSize": "1.5rem",
                  "fontWeight": "600"
                },
                "content": {
                  "padding": "0 {overlay.modal.padding} {overlay.modal.padding} {overlay.modal.padding}"
                }
              },
              "editor": {
                "toolbar": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "borderRadius": "{content.border.radius}"
                },
                "toolbarItem": {
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "activeColor": "{primary.color}"
                },
                "overlay": {
                  "background": "{overlay.select.background}",
                  "borderColor": "{overlay.select.border.color}",
                  "borderRadius": "{overlay.select.border.radius}",
                  "color": "{overlay.select.color}",
                  "shadow": "{overlay.select.shadow}",
                  "padding": "{list.padding}"
                },
                "overlayOption": {
                  "focusBackground": "{list.option.focus.background}",
                  "color": "{list.option.color}",
                  "focusColor": "{list.option.focus.color}",
                  "padding": "{list.option.padding}",
                  "borderRadius": "{list.option.border.radius}"
                },
                "content": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{content.color}",
                  "borderRadius": "{content.border.radius}"
                }
              },
              "fieldset": {
                "root": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "color": "{content.color}",
                  "padding": "0 1.125rem 1.125rem 1.125rem",
                  "transitionDuration": "{transition.duration}"
                },
                "legend": {
                  "background": "{content.background}",
                  "hoverBackground": "{content.hover.background}",
                  "color": "{content.color}",
                  "hoverColor": "{content.hover.color}",
                  "borderRadius": "{content.border.radius}",
                  "borderWidth": "1px",
                  "borderColor": "transparent",
                  "padding": "0.5rem 0.75rem",
                  "gap": "0.5rem",
                  "fontWeight": "600",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "toggleIcon": {
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.hover.muted.color}"
                },
                "content": {
                  "padding": "0"
                }
              },
              "fileupload": {
                "root": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{content.color}",
                  "borderRadius": "{content.border.radius}",
                  "transitionDuration": "{transition.duration}"
                },
                "header": {
                  "background": "transparent",
                  "color": "{text.color}",
                  "padding": "1.125rem",
                  "borderWidth": "0",
                  "borderRadius": "0",
                  "gap": "0.5rem"
                },
                "content": {
                  "highlightBorderColor": "{primary.color}",
                  "padding": "0 1.125rem 1.125rem 1.125rem"
                },
                "file": {
                  "padding": "1rem",
                  "gap": "1rem",
                  "borderColor": "{content.border.color}",
                  "info": {
                    "gap": "0.5rem"
                  }
                },
                "progressbar": {
                  "height": "0.25rem"
                },
                "basic": {
                  "gap": "0.5rem"
                }
              },
              "floatlabel": {
                "root": {
                  "color": "{form.field.float.label.color}",
                  "focusColor": "{form.field.float.label.focus.color}",
                  "invalidColor": "{form.field.float.label.invalid.color}",
                  "transitionDuration": "0.2s"
                }
              },
              "galleria": {
                "root": {
                  "borderWidth": "1px",
                  "borderColor": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "transitionDuration": "{transition.duration}"
                },
                "navButton": {
                  "background": "rgba(255, 255, 255, 0.1)",
                  "hoverBackground": "rgba(255, 255, 255, 0.2)",
                  "color": "{surface.100}",
                  "hoverColor": "{surface.0}",
                  "size": "3rem",
                  "gutter": "0.5rem",
                  "prev": {
                    "borderRadius": "50%"
                  },
                  "next": {
                    "borderRadius": "50%"
                  },
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "navIcon": {
                  "size": "1.5rem"
                },
                "thumbnailsContent": {
                  "background": "{content.background}",
                  "padding": "1rem 0.25rem"
                },
                "thumbnailNavButton": {
                  "size": "2rem",
                  "borderRadius": "{content.border.radius}",
                  "gutter": "0.5rem",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "thumbnailNavButtonIcon": {
                  "size": "1rem"
                },
                "caption": {
                  "background": "rgba(0, 0, 0, 0.5)",
                  "color": "{surface.100}",
                  "padding": "1rem"
                },
                "indicatorList": {
                  "gap": "0.5rem",
                  "padding": "1rem"
                },
                "indicatorButton": {
                  "width": "1rem",
                  "height": "1rem",
                  "activeBackground": "{primary.color}",
                  "borderRadius": "50%",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "insetIndicatorList": {
                  "background": "rgba(0, 0, 0, 0.5)"
                },
                "insetIndicatorButton": {
                  "background": "rgba(255, 255, 255, 0.4)",
                  "hoverBackground": "rgba(255, 255, 255, 0.6)",
                  "activeBackground": "rgba(255, 255, 255, 0.9)"
                },
                "mask": {
                  "background": "{mask.background}",
                  "color": "{mask.color}"
                },
                "closeButton": {
                  "size": "3rem",
                  "gutter": "0.5rem",
                  "background": "rgba(255, 255, 255, 0.1)",
                  "hoverBackground": "rgba(255, 255, 255, 0.2)",
                  "color": "{surface.50}",
                  "hoverColor": "{surface.0}",
                  "borderRadius": "50%",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "closeButtonIcon": {
                  "size": "1.5rem"
                },
                "colorScheme": {
                  "light": {
                    "thumbnailNavButton": {
                      "hoverBackground": "{surface.100}",
                      "color": "{surface.600}",
                      "hoverColor": "{surface.700}"
                    },
                    "indicatorButton": {
                      "background": "{surface.200}",
                      "hoverBackground": "{surface.300}"
                    }
                  },
                  "dark": {
                    "thumbnailNavButton": {
                      "hoverBackground": "{surface.700}",
                      "color": "{surface.400}",
                      "hoverColor": "{surface.0}"
                    },
                    "indicatorButton": {
                      "background": "{surface.700}",
                      "hoverBackground": "{surface.600}"
                    }
                  }
                }
              },
              "iconfield": {
                "icon": {
                  "color": "{form.field.icon.color}"
                }
              },
              "image": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "preview": {
                  "icon": {
                    "size": "1.5rem"
                  },
                  "mask": {
                    "background": "{mask.background}",
                    "color": "{mask.color}"
                  }
                },
                "toolbar": {
                  "position": {
                    "left": "auto",
                    "right": "1rem",
                    "top": "1rem",
                    "bottom": "auto"
                  },
                  "blur": "8px",
                  "background": "rgba(255,255,255,0.1)",
                  "borderColor": "rgba(255,255,255,0.2)",
                  "borderWidth": "1px",
                  "borderRadius": "30px",
                  "padding": ".5rem",
                  "gap": "0.5rem"
                },
                "action": {
                  "hoverBackground": "rgba(255,255,255,0.1)",
                  "color": "{surface.50}",
                  "hoverColor": "{surface.0}",
                  "size": "3rem",
                  "iconSize": "1.5rem",
                  "borderRadius": "50%",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                }
              },
              "inlinemessage": {
                "root": {
                  "padding": "{form.field.padding.y} {form.field.padding.x}",
                  "borderRadius": "{content.border.radius}",
                  "gap": "0.5rem"
                },
                "text": {
                  "fontWeight": "500"
                },
                "icon": {
                  "size": "1rem"
                },
                "colorScheme": {
                  "light": {
                    "info": {
                      "background": "color-mix(in srgb, {blue.50}, transparent 5%)",
                      "borderColor": "{blue.200}",
                      "color": "{blue.600}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)"
                    },
                    "success": {
                      "background": "color-mix(in srgb, {green.50}, transparent 5%)",
                      "borderColor": "{green.200}",
                      "color": "{green.600}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)"
                    },
                    "warn": {
                      "background": "color-mix(in srgb,{yellow.50}, transparent 5%)",
                      "borderColor": "{yellow.200}",
                      "color": "{yellow.600}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)"
                    },
                    "error": {
                      "background": "color-mix(in srgb, {red.50}, transparent 5%)",
                      "borderColor": "{red.200}",
                      "color": "{red.600}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)"
                    },
                    "secondary": {
                      "background": "{surface.100}",
                      "borderColor": "{surface.200}",
                      "color": "{surface.600}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)"
                    },
                    "contrast": {
                      "background": "{surface.900}",
                      "borderColor": "{surface.950}",
                      "color": "{surface.50}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)"
                    }
                  },
                  "dark": {
                    "info": {
                      "background": "color-mix(in srgb, {blue.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {blue.700}, transparent 64%)",
                      "color": "{blue.500}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)"
                    },
                    "success": {
                      "background": "color-mix(in srgb, {green.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {green.700}, transparent 64%)",
                      "color": "{green.500}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)"
                    },
                    "warn": {
                      "background": "color-mix(in srgb, {yellow.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {yellow.700}, transparent 64%)",
                      "color": "{yellow.500}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)"
                    },
                    "error": {
                      "background": "color-mix(in srgb, {red.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {red.700}, transparent 64%)",
                      "color": "{red.500}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)"
                    },
                    "secondary": {
                      "background": "{surface.800}",
                      "borderColor": "{surface.700}",
                      "color": "{surface.300}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)"
                    },
                    "contrast": {
                      "background": "{surface.0}",
                      "borderColor": "{surface.100}",
                      "color": "{surface.950}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)"
                    }
                  }
                }
              },
              "inplace": {
                "root": {
                  "padding": "{form.field.padding.y} {form.field.padding.x}",
                  "borderRadius": "{content.border.radius}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  },
                  "transitionDuration": "{transition.duration}"
                },
                "display": {
                  "hoverBackground": "{content.hover.background}",
                  "hoverColor": "{content.hover.color}"
                }
              },
              "inputchips": {
                "root": {
                  "background": "{form.field.background}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "filledBackground": "{form.field.filled.background}",
                  "filledFocusBackground": "{form.field.filled.focus.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.focus.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "color": "{form.field.color}",
                  "disabledColor": "{form.field.disabled.color}",
                  "placeholderColor": "{form.field.placeholder.color}",
                  "shadow": "{form.field.shadow}",
                  "paddingX": "{form.field.padding.x}",
                  "paddingY": "{form.field.padding.y}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{form.field.focus.ring.width}",
                    "style": "{form.field.focus.ring.style}",
                    "color": "{form.field.focus.ring.color}",
                    "offset": "{form.field.focus.ring.offset}",
                    "shadow": "{form.field.focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "chip": {
                  "borderRadius": "{border.radius.sm}"
                },
                "colorScheme": {
                  "light": {
                    "chip": {
                      "focusBackground": "{surface.200}",
                      "color": "{surface.800}"
                    }
                  },
                  "dark": {
                    "chip": {
                      "focusBackground": "{surface.700}",
                      "color": "{surface.0}"
                    }
                  }
                }
              },
              "inputgroup": {
                "addon": {
                  "background": "{form.field.background}",
                  "borderColor": "{form.field.border.color}",
                  "color": "{form.field.icon.color}",
                  "borderRadius": "{form.field.border.radius}"
                }
              },
              "inputnumber": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "button": {
                  "width": "2.5rem",
                  "borderRadius": "{form.field.border.radius}",
                  "verticalPadding": "{form.field.padding.y}"
                },
                "colorScheme": {
                  "light": {
                    "button": {
                      "background": "transparent",
                      "hoverBackground": "{surface.100}",
                      "activeBackground": "{surface.200}",
                      "borderColor": "{form.field.border.color}",
                      "hoverBorderColor": "{form.field.border.color}",
                      "activeBorderColor": "{form.field.border.color}",
                      "color": "{surface.400}",
                      "hoverColor": "{surface.500}",
                      "activeColor": "{surface.600}"
                    }
                  },
                  "dark": {
                    "button": {
                      "background": "transparent",
                      "hoverBackground": "{surface.800}",
                      "activeBackground": "{surface.700}",
                      "borderColor": "{form.field.border.color}",
                      "hoverBorderColor": "{form.field.border.color}",
                      "activeBorderColor": "{form.field.border.color}",
                      "color": "{surface.400}",
                      "hoverColor": "{surface.300}",
                      "activeColor": "{surface.200}"
                    }
                  }
                }
              },
              "inputtext": {
                "root": {
                  "background": "{form.field.background}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "filledBackground": "{form.field.filled.background}",
                  "filledFocusBackground": "{form.field.filled.focus.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.focus.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "color": "{form.field.color}",
                  "disabledColor": "{form.field.disabled.color}",
                  "placeholderColor": "{form.field.placeholder.color}",
                  "shadow": "{form.field.shadow}",
                  "paddingX": "{form.field.padding.x}",
                  "paddingY": "{form.field.padding.y}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{form.field.focus.ring.width}",
                    "style": "{form.field.focus.ring.style}",
                    "color": "{form.field.focus.ring.color}",
                    "offset": "{form.field.focus.ring.offset}",
                    "shadow": "{form.field.focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}",
                  "sm": {
                    "fontSize": "0.875rem",
                    "paddingX": "0.625rem",
                    "paddingY": "0.375rem"
                  },
                  "lg": {
                    "fontSize": "1.125rem",
                    "paddingX": "0.875rem",
                    "paddingY": "0.625rem"
                  }
                }
              },
              "knob": {
                "root": {
                  "transitionDuration": "{transition.duration}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "value": {
                  "background": "{primary.color}"
                },
                "range": {
                  "background": "{content.border.color}"
                },
                "text": {
                  "color": "{text.muted.color}"
                }
              },
              "listbox": {
                "root": {
                  "background": "{form.field.background}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.focus.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "color": "{form.field.color}",
                  "disabledColor": "{form.field.disabled.color}",
                  "shadow": "{form.field.shadow}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{form.field.focus.ring.width}",
                    "style": "{form.field.focus.ring.style}",
                    "color": "{form.field.focus.ring.color}",
                    "offset": "{form.field.focus.ring.offset}",
                    "shadow": "{form.field.focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "list": {
                  "padding": "{list.padding}",
                  "gap": "{list.gap}",
                  "header": {
                    "padding": "{list.header.padding}"
                  }
                },
                "option": {
                  "focusBackground": "{list.option.focus.background}",
                  "selectedBackground": "{list.option.selected.background}",
                  "selectedFocusBackground": "{list.option.selected.focus.background}",
                  "color": "{list.option.color}",
                  "focusColor": "{list.option.focus.color}",
                  "selectedColor": "{list.option.selected.color}",
                  "selectedFocusColor": "{list.option.selected.focus.color}",
                  "padding": "{list.option.padding}",
                  "borderRadius": "{list.option.border.radius}"
                },
                "optionGroup": {
                  "background": "{list.option.group.background}",
                  "color": "{list.option.group.color}",
                  "fontWeight": "{list.option.group.font.weight}",
                  "padding": "{list.option.group.padding}"
                },
                "checkmark": {
                  "color": "{list.option.color}",
                  "gutterStart": "-0.375rem",
                  "gutterEnd": "0.375rem"
                },
                "emptyMessage": {
                  "padding": "{list.option.padding}"
                },
                "colorScheme": {
                  "light": {
                    "option": {
                      "stripedBackground": "{surface.50}"
                    }
                  },
                  "dark": {
                    "option": {
                      "stripedBackground": "{surface.900}"
                    }
                  }
                }
              },
              "megamenu": {
                "root": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "color": "{content.color}",
                  "gap": "0.5rem",
                  "verticalOrientation": {
                    "padding": "{navigation.list.padding}",
                    "gap": "0"
                  },
                  "horizontalOrientation": {
                    "padding": "0.5rem 0.75rem"
                  },
                  "transitionDuration": "{transition.duration}"
                },
                "baseItem": {
                  "borderRadius": "{content.border.radius}",
                  "padding": "{navigation.item.padding}"
                },
                "item": {
                  "focusBackground": "{navigation.item.focus.background}",
                  "activeBackground": "{navigation.item.active.background}",
                  "color": "{navigation.item.color}",
                  "focusColor": "{navigation.item.focus.color}",
                  "activeColor": "{navigation.item.active.color}",
                  "padding": "{navigation.item.padding}",
                  "borderRadius": "{navigation.item.border.radius}",
                  "gap": "{navigation.item.gap}",
                  "icon": {
                    "color": "{navigation.item.icon.color}",
                    "focusColor": "{navigation.item.icon.focus.color}",
                    "activeColor": "{navigation.item.icon.active.color}"
                  }
                },
                "overlay": {
                  "padding": "0",
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "color": "{content.color}",
                  "shadow": "{overlay.navigation.shadow}",
                  "gap": "0.5rem"
                },
                "submenu": {
                  "padding": "{navigation.list.padding}",
                  "gap": "{navigation.list.gap}"
                },
                "submenuLabel": {
                  "padding": "{navigation.submenu.label.padding}",
                  "fontWeight": "{navigation.submenu.label.font.weight}",
                  "background": "{navigation.submenu.label.background.}",
                  "color": "{navigation.submenu.label.color}"
                },
                "submenuIcon": {
                  "size": "{navigation.submenu.icon.size}",
                  "color": "{navigation.submenu.icon.color}",
                  "focusColor": "{navigation.submenu.icon.focus.color}",
                  "activeColor": "{navigation.submenu.icon.active.color}"
                },
                "separator": {
                  "borderColor": "{content.border.color}"
                },
                "mobileButton": {
                  "borderRadius": "50%",
                  "size": "1.75rem",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.muted.hover.color}",
                  "hoverBackground": "{content.hover.background}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                }
              },
              "menu": {
                "root": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{content.color}",
                  "borderRadius": "{content.border.radius}",
                  "shadow": "{overlay.navigation.shadow}",
                  "transitionDuration": "{transition.duration}"
                },
                "list": {
                  "padding": "{navigation.list.padding}",
                  "gap": "{navigation.list.gap}"
                },
                "item": {
                  "focusBackground": "{navigation.item.focus.background}",
                  "color": "{navigation.item.color}",
                  "focusColor": "{navigation.item.focus.color}",
                  "padding": "{navigation.item.padding}",
                  "borderRadius": "{navigation.item.border.radius}",
                  "gap": "{navigation.item.gap}",
                  "icon": {
                    "color": "{navigation.item.icon.color}",
                    "focusColor": "{navigation.item.icon.focus.color}"
                  }
                },
                "submenuLabel": {
                  "padding": "{navigation.submenu.label.padding}",
                  "fontWeight": "{navigation.submenu.label.font.weight}",
                  "background": "{navigation.submenu.label.background}",
                  "color": "{navigation.submenu.label.color}"
                },
                "separator": {
                  "borderColor": "{content.border.color}"
                }
              },
              "menubar": {
                "root": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "color": "{content.color}",
                  "gap": "0.5rem",
                  "padding": "0.5rem 0.75rem",
                  "transitionDuration": "{transition.duration}"
                },
                "baseItem": {
                  "borderRadius": "{content.border.radius}",
                  "padding": "{navigation.item.padding}"
                },
                "item": {
                  "focusBackground": "{navigation.item.focus.background}",
                  "activeBackground": "{navigation.item.active.background}",
                  "color": "{navigation.item.color}",
                  "focusColor": "{navigation.item.focus.color}",
                  "activeColor": "{navigation.item.active.color}",
                  "padding": "{navigation.item.padding}",
                  "borderRadius": "{navigation.item.border.radius}",
                  "gap": "{navigation.item.gap}",
                  "icon": {
                    "color": "{navigation.item.icon.color}",
                    "focusColor": "{navigation.item.icon.focus.color}",
                    "activeColor": "{navigation.item.icon.active.color}"
                  }
                },
                "submenu": {
                  "padding": "{navigation.list.padding}",
                  "gap": "{navigation.list.gap}",
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "shadow": "{overlay.navigation.shadow}",
                  "mobileIndent": "1rem"
                },
                "submenuIcon": {
                  "size": "{navigation.submenu.icon.size}",
                  "color": "{navigation.submenu.icon.color}",
                  "focusColor": "{navigation.submenu.icon.focus.color}",
                  "activeColor": "{navigation.submenu.icon.active.color}"
                },
                "separator": {
                  "borderColor": "{content.border.color}"
                },
                "mobileButton": {
                  "borderRadius": "50%",
                  "size": "1.75rem",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.muted.hover.color}",
                  "hoverBackground": "{content.hover.background}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                }
              },
              "message": {
                "root": {
                  "borderRadius": "{content.border.radius}",
                  "borderWidth": "1px",
                  "transitionDuration": "{transition.duration}"
                },
                "content": {
                  "padding": "0.5rem 0.75rem",
                  "gap": "0.5rem"
                },
                "text": {
                  "fontSize": "1rem",
                  "fontWeight": "500"
                },
                "icon": {
                  "size": "1.125rem"
                },
                "closeButton": {
                  "width": "1.75rem",
                  "height": "1.75rem",
                  "borderRadius": "50%",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "offset": "{focus.ring.offset}"
                  }
                },
                "closeIcon": {
                  "size": "1rem"
                },
                "colorScheme": {
                  "light": {
                    "info": {
                      "background": "color-mix(in srgb, {blue.50}, transparent 5%)",
                      "borderColor": "{blue.200}",
                      "color": "{blue.600}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{blue.100}",
                        "focusRing": {
                          "color": "{blue.600}",
                          "shadow": "none"
                        }
                      }
                    },
                    "success": {
                      "background": "color-mix(in srgb, {green.50}, transparent 5%)",
                      "borderColor": "{green.200}",
                      "color": "{green.600}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{green.100}",
                        "focusRing": {
                          "color": "{green.600}",
                          "shadow": "none"
                        }
                      }
                    },
                    "warn": {
                      "background": "color-mix(in srgb,{yellow.50}, transparent 5%)",
                      "borderColor": "{yellow.200}",
                      "color": "{yellow.600}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{yellow.100}",
                        "focusRing": {
                          "color": "{yellow.600}",
                          "shadow": "none"
                        }
                      }
                    },
                    "error": {
                      "background": "color-mix(in srgb, {red.50}, transparent 5%)",
                      "borderColor": "{red.200}",
                      "color": "{red.600}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{red.100}",
                        "focusRing": {
                          "color": "{red.600}",
                          "shadow": "none"
                        }
                      }
                    },
                    "secondary": {
                      "background": "{surface.100}",
                      "borderColor": "{surface.200}",
                      "color": "{surface.600}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{surface.200}",
                        "focusRing": {
                          "color": "{surface.600}",
                          "shadow": "none"
                        }
                      }
                    },
                    "contrast": {
                      "background": "{surface.900}",
                      "borderColor": "{surface.950}",
                      "color": "{surface.50}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{surface.800}",
                        "focusRing": {
                          "color": "{surface.50}",
                          "shadow": "none"
                        }
                      }
                    }
                  },
                  "dark": {
                    "info": {
                      "background": "color-mix(in srgb, {blue.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {blue.700}, transparent 64%)",
                      "color": "{blue.500}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "rgba(255, 255, 255, 0.05)",
                        "focusRing": {
                          "color": "{blue.500}",
                          "shadow": "none"
                        }
                      }
                    },
                    "success": {
                      "background": "color-mix(in srgb, {green.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {green.700}, transparent 64%)",
                      "color": "{green.500}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "rgba(255, 255, 255, 0.05)",
                        "focusRing": {
                          "color": "{green.500}",
                          "shadow": "none"
                        }
                      }
                    },
                    "warn": {
                      "background": "color-mix(in srgb, {yellow.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {yellow.700}, transparent 64%)",
                      "color": "{yellow.500}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "rgba(255, 255, 255, 0.05)",
                        "focusRing": {
                          "color": "{yellow.500}",
                          "shadow": "none"
                        }
                      }
                    },
                    "error": {
                      "background": "color-mix(in srgb, {red.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {red.700}, transparent 64%)",
                      "color": "{red.500}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "rgba(255, 255, 255, 0.05)",
                        "focusRing": {
                          "color": "{red.500}",
                          "shadow": "none"
                        }
                      }
                    },
                    "secondary": {
                      "background": "{surface.800}",
                      "borderColor": "{surface.700}",
                      "color": "{surface.300}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{surface.700}",
                        "focusRing": {
                          "color": "{surface.300}",
                          "shadow": "none"
                        }
                      }
                    },
                    "contrast": {
                      "background": "{surface.0}",
                      "borderColor": "{surface.100}",
                      "color": "{surface.950}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{surface.100}",
                        "focusRing": {
                          "color": "{surface.950}",
                          "shadow": "none"
                        }
                      }
                    }
                  }
                }
              },
              "metergroup": {
                "root": {
                  "borderRadius": "{content.border.radius}",
                  "gap": "1rem"
                },
                "meters": {
                  "background": "{content.border.color}",
                  "size": "0.5rem"
                },
                "label": {
                  "gap": "0.5rem"
                },
                "labelMarker": {
                  "size": "0.5rem"
                },
                "labelIcon": {
                  "size": "1rem"
                },
                "labelList": {
                  "verticalGap": "0.5rem",
                  "horizontalGap": "1rem"
                }
              },
              "multiselect": {
                "root": {
                  "background": "{form.field.background}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "filledBackground": "{form.field.filled.background}",
                  "filledFocusBackground": "{form.field.filled.focus.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.focus.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "color": "{form.field.color}",
                  "disabledColor": "{form.field.disabled.color}",
                  "placeholderColor": "{form.field.placeholder.color}",
                  "shadow": "{form.field.shadow}",
                  "paddingX": "{form.field.padding.x}",
                  "paddingY": "{form.field.padding.y}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{form.field.focus.ring.width}",
                    "style": "{form.field.focus.ring.style}",
                    "color": "{form.field.focus.ring.color}",
                    "offset": "{form.field.focus.ring.offset}",
                    "shadow": "{form.field.focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "dropdown": {
                  "width": "2.5rem",
                  "color": "{form.field.icon.color}"
                },
                "overlay": {
                  "background": "{overlay.select.background}",
                  "borderColor": "{overlay.select.border.color}",
                  "borderRadius": "{overlay.select.border.radius}",
                  "color": "{overlay.select.color}",
                  "shadow": "{overlay.select.shadow}"
                },
                "list": {
                  "padding": "{list.padding}",
                  "gap": "{list.gap}",
                  "header": {
                    "padding": "{list.header.padding}"
                  }
                },
                "option": {
                  "focusBackground": "{list.option.focus.background}",
                  "selectedBackground": "{list.option.selected.background}",
                  "selectedFocusBackground": "{list.option.selected.focus.background}",
                  "color": "{list.option.color}",
                  "focusColor": "{list.option.focus.color}",
                  "selectedColor": "{list.option.selected.color}",
                  "selectedFocusColor": "{list.option.selected.focus.color}",
                  "padding": "{list.option.padding}",
                  "borderRadius": "{list.option.border.radius}",
                  "gap": "0.5rem"
                },
                "optionGroup": {
                  "background": "{list.option.group.background}",
                  "color": "{list.option.group.color}",
                  "fontWeight": "{list.option.group.font.weight}",
                  "padding": "{list.option.group.padding}"
                },
                "chip": {
                  "borderRadius": "{border.radius.sm}"
                },
                "emptyMessage": {
                  "padding": "{list.option.padding}"
                }
              },
              "orderlist": {
                "root": {
                  "gap": "1.125rem"
                },
                "controls": {
                  "gap": "0.5rem"
                }
              },
              "organizationchart": {
                "root": {
                  "gutter": "0.75rem",
                  "transitionDuration": "{transition.duration}"
                },
                "node": {
                  "background": "{content.background}",
                  "hoverBackground": "{content.hover.background}",
                  "selectedBackground": "{highlight.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{content.color}",
                  "selectedColor": "{highlight.color}",
                  "hoverColor": "{content.hover.color}",
                  "padding": "0.75rem 1rem",
                  "toggleablePadding": "0.75rem 1rem 1.25rem 1rem",
                  "borderRadius": "{content.border.radius}"
                },
                "nodeToggleButton": {
                  "background": "{content.background}",
                  "hoverBackground": "{content.hover.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "size": "1.5rem",
                  "borderRadius": "50%",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "connector": {
                  "color": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "height": "24px"
                }
              },
              "overlaybadge": {
                "root": {
                  "outline": {
                    "width": "2px",
                    "color": "{content.background}"
                  }
                }
              },
              "popover": {
                "root": {
                  "background": "{overlay.popover.background}",
                  "borderColor": "{overlay.popover.border.color}",
                  "color": "{overlay.popover.color}",
                  "borderRadius": "{overlay.popover.border.radius}",
                  "shadow": "{overlay.popover.shadow}",
                  "gutter": "10px",
                  "arrowOffset": "1.25rem"
                },
                "content": {
                  "padding": "{overlay.popover.padding}"
                }
              },
              "paginator": {
                "root": {
                  "padding": "0.5rem 1rem",
                  "gap": "0.25rem",
                  "borderRadius": "{content.border.radius}",
                  "background": "{content.background}",
                  "color": "{content.color}",
                  "transitionDuration": "{transition.duration}"
                },
                "navButton": {
                  "background": "transparent",
                  "hoverBackground": "{content.hover.background}",
                  "selectedBackground": "{highlight.background}",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.hover.muted.color}",
                  "selectedColor": "{highlight.color}",
                  "width": "2.5rem",
                  "height": "2.5rem",
                  "borderRadius": "50%",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "currentPageReport": {
                  "color": "{text.muted.color}"
                },
                "jumpToPageInput": {
                  "maxWidth": "2.5rem"
                }
              },
              "password": {
                "meter": {
                  "background": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "height": ".75rem"
                },
                "icon": {
                  "color": "{form.field.icon.color}"
                },
                "overlay": {
                  "background": "{overlay.popover.background}",
                  "borderColor": "{overlay.popover.border.color}",
                  "borderRadius": "{overlay.popover.border.radius}",
                  "color": "{overlay.popover.color}",
                  "padding": "{overlay.popover.padding}",
                  "shadow": "{overlay.popover.shadow}"
                },
                "content": {
                  "gap": "0.5rem"
                },
                "colorScheme": {
                  "light": {
                    "strength": {
                      "weakBackground": "{red.500}",
                      "mediumBackground": "{amber.500}",
                      "strongBackground": "{green.500}"
                    }
                  },
                  "dark": {
                    "strength": {
                      "weakBackground": "{red.400}",
                      "mediumBackground": "{amber.400}",
                      "strongBackground": "{green.400}"
                    }
                  }
                }
              },
              "panel": {
                "root": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{content.color}",
                  "borderRadius": "{content.border.radius}"
                },
                "header": {
                  "background": "transparent",
                  "color": "{text.color}",
                  "padding": "1.125rem",
                  "borderColor": "{content.border.color}",
                  "borderWidth": "0",
                  "borderRadius": "0"
                },
                "toggleableHeader": {
                  "padding": "0.375rem 1.125rem"
                },
                "title": {
                  "fontWeight": "600"
                },
                "content": {
                  "padding": "0 1.125rem 1.125rem 1.125rem"
                },
                "footer": {
                  "padding": "0 1.125rem 1.125rem 1.125rem"
                }
              },
              "panelmenu": {
                "root": {
                  "gap": "0.5rem",
                  "transitionDuration": "{transition.duration}"
                },
                "panel": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "borderWidth": "1px",
                  "color": "{content.color}",
                  "padding": "0.25rem 0.25rem",
                  "borderRadius": "{content.border.radius}",
                  "first": {
                    "borderWidth": "1px",
                    "topBorderRadius": "{content.border.radius}"
                  },
                  "last": {
                    "borderWidth": "1px",
                    "bottomBorderRadius": "{content.border.radius}"
                  }
                },
                "item": {
                  "focusBackground": "{navigation.item.focus.background}",
                  "color": "{navigation.item.color}",
                  "focusColor": "{navigation.item.focus.color}",
                  "gap": "0.5rem",
                  "padding": "{navigation.item.padding}",
                  "borderRadius": "{content.border.radius}",
                  "icon": {
                    "color": "{navigation.item.icon.color}",
                    "focusColor": "{navigation.item.icon.focus.color}"
                  }
                },
                "submenu": {
                  "indent": "1rem"
                },
                "submenuIcon": {
                  "color": "{navigation.submenu.icon.color}",
                  "focusColor": "{navigation.submenu.icon.focus.color}"
                }
              },
              "picklist": {
                "root": {
                  "gap": "1.125rem"
                },
                "controls": {
                  "gap": "0.5rem"
                }
              },
              "progressbar": {
                "root": {
                  "background": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "height": "1.25rem"
                },
                "value": {
                  "background": "{primary.color}"
                },
                "label": {
                  "color": "{primary.contrast.color}",
                  "fontSize": "0.75rem",
                  "fontWeight": "600"
                }
              },
              "progressspinner": {
                "colorScheme": {
                  "light": {
                    "root": {
                      "color.1": "{red.500}",
                      "color.2": "{blue.500}",
                      "color.3": "{green.500}",
                      "color.4": "{yellow.500}"
                    }
                  },
                  "dark": {
                    "root": {
                      "color.1": "{red.400}",
                      "color.2": "{blue.400}",
                      "color.3": "{green.400}",
                      "color.4": "{yellow.400}"
                    }
                  }
                }
              },
              "radiobutton": {
                "root": {
                  "width": "1.25rem",
                  "height": "1.25rem",
                  "background": "{form.field.background}",
                  "checkedBackground": "{primary.color}",
                  "checkedHoverBackground": "{primary.hover.color}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "filledBackground": "{form.field.filled.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.border.color}",
                  "checkedBorderColor": "{primary.color}",
                  "checkedHoverBorderColor": "{primary.hover.color}",
                  "checkedFocusBorderColor": "{primary.color}",
                  "checkedDisabledBorderColor": "{form.field.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "shadow": "{form.field.shadow}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "icon": {
                  "size": "0.75rem",
                  "checkedColor": "{primary.contrast.color}",
                  "checkedHoverColor": "{primary.contrast.color}",
                  "disabledColor": "{form.field.disabled.color}"
                }
              },
              "rating": {
                "root": {
                  "gap": "0.25rem",
                  "transitionDuration": "{transition.duration}"
                },
                "icon": {
                  "size": "1rem",
                  "color": "{text.muted.color}",
                  "hoverColor": "{primary.color}",
                  "activeColor": "{primary.color}"
                }
              },
              "scrollpanel": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "bar": {
                  "size": "9px",
                  "borderRadius": "{border.radius.sm}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "colorScheme": {
                  "light": {
                    "bar": {
                      "background": "{surface.100}"
                    }
                  },
                  "dark": {
                    "bar": {
                      "background": "{surface.800}"
                    }
                  }
                }
              },
              "select": {
                "root": {
                  "background": "{form.field.background}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "filledBackground": "{form.field.filled.background}",
                  "filledFocusBackground": "{form.field.filled.focus.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.focus.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "color": "{form.field.color}",
                  "disabledColor": "{form.field.disabled.color}",
                  "placeholderColor": "{form.field.placeholder.color}",
                  "shadow": "{form.field.shadow}",
                  "paddingX": "{form.field.padding.x}",
                  "paddingY": "{form.field.padding.y}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{form.field.focus.ring.width}",
                    "style": "{form.field.focus.ring.style}",
                    "color": "{form.field.focus.ring.color}",
                    "offset": "{form.field.focus.ring.offset}",
                    "shadow": "{form.field.focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "dropdown": {
                  "width": "2.5rem",
                  "color": "{form.field.icon.color}"
                },
                "overlay": {
                  "background": "{overlay.select.background}",
                  "borderColor": "{overlay.select.border.color}",
                  "borderRadius": "{overlay.select.border.radius}",
                  "color": "{overlay.select.color}",
                  "shadow": "{overlay.select.shadow}"
                },
                "list": {
                  "padding": "{list.padding}",
                  "gap": "{list.gap}",
                  "header": {
                    "padding": "{list.header.padding}"
                  }
                },
                "option": {
                  "focusBackground": "{list.option.focus.background}",
                  "selectedBackground": "{list.option.selected.background}",
                  "selectedFocusBackground": "{list.option.selected.focus.background}",
                  "color": "{list.option.color}",
                  "focusColor": "{list.option.focus.color}",
                  "selectedColor": "{list.option.selected.color}",
                  "selectedFocusColor": "{list.option.selected.focus.color}",
                  "padding": "{list.option.padding}",
                  "borderRadius": "{list.option.border.radius}"
                },
                "optionGroup": {
                  "background": "{list.option.group.background}",
                  "color": "{list.option.group.color}",
                  "fontWeight": "{list.option.group.font.weight}",
                  "padding": "{list.option.group.padding}"
                },
                "clearIcon": {
                  "color": "{form.field.icon.color}"
                },
                "checkmark": {
                  "color": "{list.option.color}",
                  "gutterStart": "-0.375rem",
                  "gutterEnd": "0.375rem"
                },
                "emptyMessage": {
                  "padding": "{list.option.padding}"
                }
              },
              "selectbutton": {
                "root": {
                  "borderRadius": "{form.field.border.radius}"
                },
                "colorScheme": {
                  "light": {
                    "root": {
                      "invalidBorderColor": "{form.field.invalid.border.color}"
                    }
                  },
                  "dark": {
                    "root": {
                      "invalidBorderColor": "{form.field.invalid.border.color}"
                    }
                  }
                }
              },
              "skeleton": {
                "root": {
                  "borderRadius": "{content.border.radius}"
                },
                "colorScheme": {
                  "light": {
                    "root": {
                      "background": "{surface.200}",
                      "animationBackground": "rgba(255,255,255,0.4)"
                    }
                  },
                  "dark": {
                    "root": {
                      "background": "rgba(255, 255, 255, 0.06)",
                      "animationBackground": "rgba(255, 255, 255, 0.04)"
                    }
                  }
                }
              },
              "slider": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "track": {
                  "background": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "size": "3px"
                },
                "range": {
                  "background": "{primary.color}"
                },
                "handle": {
                  "width": "20px",
                  "height": "20px",
                  "borderRadius": "50%",
                  "background": "{content.border.color}",
                  "hoverBackground": "{content.border.color}",
                  "content": {
                    "borderRadius": "50%",
                    "hoverBackground": "{content.background}",
                    "width": "16px",
                    "height": "16px",
                    "shadow": "0px 0.5px 0px 0px rgba(0, 0, 0, 0.08), 0px 1px 1px 0px rgba(0, 0, 0, 0.14)"
                  },
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "colorScheme": {
                  "light": {
                    "handle": {
                      "contentBackground": "{surface.0}"
                    }
                  },
                  "dark": {
                    "handle": {
                      "contentBackground": "{surface.950}"
                    }
                  }
                }
              },
              "speeddial": {
                "root": {
                  "gap": "0.5rem",
                  "transitionDuration": "{transition.duration}"
                }
              },
              "splitter": {
                "root": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{content.color}",
                  "transitionDuration": "{transition.duration}"
                },
                "gutter": {
                  "background": "{content.border.color}"
                },
                "handle": {
                  "size": "24px",
                  "background": "transparent",
                  "borderRadius": "{content.border.radius}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                }
              },
              "splitbutton": {
                "root": {
                  "borderRadius": "{form.field.border.radius}",
                  "roundedBorderRadius": "2rem",
                  "raisedShadow": "0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)"
                }
              },
              "stepper": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "separator": {
                  "background": "{content.border.color}",
                  "activeBackground": "{primary.color}",
                  "margin": "0 0 0 1.625rem",
                  "size": "2px"
                },
                "step": {
                  "padding": "0.5rem",
                  "gap": "1rem"
                },
                "stepHeader": {
                  "padding": "0",
                  "borderRadius": "{content.border.radius}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  },
                  "gap": "0.5rem"
                },
                "stepTitle": {
                  "color": "{text.muted.color}",
                  "activeColor": "{primary.color}",
                  "fontWeight": "500"
                },
                "stepNumber": {
                  "background": "{content.background}",
                  "activeBackground": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "activeBorderColor": "{content.border.color}",
                  "color": "{text.muted.color}",
                  "activeColor": "{primary.color}",
                  "size": "2rem",
                  "fontSize": "1.143rem",
                  "fontWeight": "500",
                  "borderRadius": "50%",
                  "shadow": "0px 0.5px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.12)"
                },
                "steppanels": {
                  "padding": "0.875rem 0.5rem 1.125rem 0.5rem"
                },
                "steppanel": {
                  "background": "{content.background}",
                  "color": "{content.color}",
                  "padding": "0 0 0 1rem"
                }
              },
              "steps": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "separator": {
                  "background": "{content.border.color}"
                },
                "itemLink": {
                  "borderRadius": "{content.border.radius}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  },
                  "gap": "0.5rem"
                },
                "itemLabel": {
                  "color": "{text.muted.color}",
                  "activeColor": "{primary.color}",
                  "fontWeight": "500"
                },
                "itemNumber": {
                  "background": "{content.background}",
                  "activeBackground": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "activeBorderColor": "{content.border.color}",
                  "color": "{text.muted.color}",
                  "activeColor": "{primary.color}",
                  "size": "2rem",
                  "fontSize": "1.143rem",
                  "fontWeight": "500",
                  "borderRadius": "50%",
                  "shadow": "0px 0.5px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.12)"
                }
              },
              "tabmenu": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "tablist": {
                  "borderWidth": "0 0 1px 0",
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}"
                },
                "item": {
                  "background": "transparent",
                  "hoverBackground": "transparent",
                  "activeBackground": "transparent",
                  "borderWidth": "0 0 1px 0",
                  "borderColor": "{content.border.color}",
                  "hoverBorderColor": "{content.border.color}",
                  "activeBorderColor": "{primary.color}",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "activeColor": "{primary.color}",
                  "padding": "1rem 1.125rem",
                  "fontWeight": "600",
                  "margin": "0 0 -1px 0",
                  "gap": "0.5rem",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "itemIcon": {
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "activeColor": "{primary.color}"
                },
                "activeBar": {
                  "height": "1px",
                  "bottom": "-1px",
                  "background": "{primary.color}"
                }
              },
              "tabs": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "tablist": {
                  "borderWidth": "0 0 1px 0",
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}"
                },
                "tab": {
                  "background": "transparent",
                  "hoverBackground": "transparent",
                  "activeBackground": "transparent",
                  "borderWidth": "0 0 1px 0",
                  "borderColor": "{content.border.color}",
                  "hoverBorderColor": "{content.border.color}",
                  "activeBorderColor": "{primary.color}",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "activeColor": "{primary.color}",
                  "padding": "1rem 1.125rem",
                  "fontWeight": "600",
                  "margin": "0 0 -1px 0",
                  "gap": "0.5rem",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "-1px",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "tabpanel": {
                  "background": "{content.background}",
                  "color": "{content.color}",
                  "padding": "0.875rem 1.125rem 1.125rem 1.125rem",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "inset {focus.ring.shadow}"
                  }
                },
                "navButton": {
                  "background": "{content.background}",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "width": "2.5rem",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "-1px",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "activeBar": {
                  "height": "1px",
                  "bottom": "-1px",
                  "background": "{primary.color}"
                },
                "colorScheme": {
                  "light": {
                    "navButton": {
                      "shadow": "0px 0px 10px 50px rgba(255, 255, 255, 0.6)"
                    }
                  },
                  "dark": {
                    "navButton": {
                      "shadow": "0px 0px 10px 50px color-mix(in srgb, {content.background}, transparent 50%)"
                    }
                  }
                }
              },
              "tabview": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "tabList": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}"
                },
                "tab": {
                  "borderColor": "{content.border.color}",
                  "activeBorderColor": "{primary.color}",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "activeColor": "{primary.color}"
                },
                "tabPanel": {
                  "background": "{content.background}",
                  "color": "{content.color}"
                },
                "navButton": {
                  "background": "{content.background}",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}"
                },
                "colorScheme": {
                  "light": {
                    "navButton": {
                      "shadow": "0px 0px 10px 50px rgba(255, 255, 255, 0.6)"
                    }
                  },
                  "dark": {
                    "navButton": {
                      "shadow": "0px 0px 10px 50px color-mix(in srgb, {content.background}, transparent 50%)"
                    }
                  }
                }
              },
              "textarea": {
                "root": {
                  "background": "{form.field.background}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "filledBackground": "{form.field.filled.background}",
                  "filledFocusBackground": "{form.field.filled.focus.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.focus.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "color": "{form.field.color}",
                  "disabledColor": "{form.field.disabled.color}",
                  "placeholderColor": "{form.field.placeholder.color}",
                  "shadow": "{form.field.shadow}",
                  "paddingX": "{form.field.padding.x}",
                  "paddingY": "{form.field.padding.y}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{form.field.focus.ring.width}",
                    "style": "{form.field.focus.ring.style}",
                    "color": "{form.field.focus.ring.color}",
                    "offset": "{form.field.focus.ring.offset}",
                    "shadow": "{form.field.focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                }
              },
              "tieredmenu": {
                "root": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "color": "{content.color}",
                  "borderRadius": "{content.border.radius}",
                  "shadow": "{overlay.navigation.shadow}",
                  "transitionDuration": "{transition.duration}"
                },
                "list": {
                  "padding": "{navigation.list.padding}",
                  "gap": "{navigation.list.gap}"
                },
                "item": {
                  "focusBackground": "{navigation.item.focus.background}",
                  "activeBackground": "{navigation.item.active.background}",
                  "color": "{navigation.item.color}",
                  "focusColor": "{navigation.item.focus.color}",
                  "activeColor": "{navigation.item.active.color}",
                  "padding": "{navigation.item.padding}",
                  "borderRadius": "{navigation.item.border.radius}",
                  "gap": "{navigation.item.gap}",
                  "icon": {
                    "color": "{navigation.item.icon.color}",
                    "focusColor": "{navigation.item.icon.focus.color}",
                    "activeColor": "{navigation.item.icon.active.color}"
                  }
                },
                "submenuLabel": {
                  "padding": "{navigation.submenu.label.padding}",
                  "fontWeight": "{navigation.submenu.label.font.weight}",
                  "background": "{navigation.submenu.label.background.}",
                  "color": "{navigation.submenu.label.color}"
                },
                "submenuIcon": {
                  "size": "{navigation.submenu.icon.size}",
                  "color": "{navigation.submenu.icon.color}",
                  "focusColor": "{navigation.submenu.icon.focus.color}",
                  "activeColor": "{navigation.submenu.icon.active.color}"
                },
                "separator": {
                  "borderColor": "{content.border.color}"
                }
              },
              "tag": {
                "root": {
                  "fontSize": "0.875rem",
                  "fontWeight": "700",
                  "padding": "0.25rem 0.5rem",
                  "gap": "0.25rem",
                  "borderRadius": "{content.border.radius}",
                  "roundedBorderRadius": "{border.radius.xl}"
                },
                "icon": {
                  "size": "0.75rem"
                },
                "colorScheme": {
                  "light": {
                    "primary": {
                      "background": "{primary.100}",
                      "color": "{primary.700}"
                    },
                    "secondary": {
                      "background": "{surface.100}",
                      "color": "{surface.600}"
                    },
                    "success": {
                      "background": "{green.100}",
                      "color": "{green.700}"
                    },
                    "info": {
                      "background": "{sky.100}",
                      "color": "{sky.700}"
                    },
                    "warn": {
                      "background": "{orange.100}",
                      "color": "{orange.700}"
                    },
                    "danger": {
                      "background": "{red.100}",
                      "color": "{red.700}"
                    },
                    "contrast": {
                      "background": "{surface.950}",
                      "color": "{surface.0}"
                    }
                  },
                  "dark": {
                    "primary": {
                      "background": "color-mix(in srgb, {primary.500}, transparent 84%)",
                      "color": "{primary.300}"
                    },
                    "secondary": {
                      "background": "{surface.800}",
                      "color": "{surface.300}"
                    },
                    "success": {
                      "background": "color-mix(in srgb, {green.500}, transparent 84%)",
                      "color": "{green.300}"
                    },
                    "info": {
                      "background": "color-mix(in srgb, {sky.500}, transparent 84%)",
                      "color": "{sky.300}"
                    },
                    "warn": {
                      "background": "color-mix(in srgb, {orange.500}, transparent 84%)",
                      "color": "{orange.300}"
                    },
                    "danger": {
                      "background": "color-mix(in srgb, {red.500}, transparent 84%)",
                      "color": "{red.300}"
                    },
                    "contrast": {
                      "background": "{surface.0}",
                      "color": "{surface.950}"
                    }
                  }
                }
              },
              "terminal": {
                "root": {
                  "background": "{form.field.background}",
                  "borderColor": "{form.field.border.color}",
                  "color": "{form.field.color}",
                  "height": "18rem",
                  "padding": "{form.field.padding.y} {form.field.padding.x}",
                  "borderRadius": "{form.field.border.radius}"
                },
                "prompt": {
                  "gap": "0.25rem"
                },
                "commandResponse": {
                  "margin": "2px 0"
                }
              },
              "timeline": {
                "event": {
                  "minHeight": "5rem"
                },
                "horizontal": {
                  "eventContent": {
                    "padding": "1rem 0"
                  }
                },
                "vertical": {
                  "eventContent": {
                    "padding": "0 1rem"
                  }
                },
                "eventMarker": {
                  "size": "1.125rem",
                  "borderRadius": "50%",
                  "borderWidth": "2px",
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "content": {
                    "borderRadius": "50%",
                    "size": "0.375rem",
                    "background": "{primary.color}",
                    "insetShadow": "0px 0.5px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.12)"
                  }
                },
                "eventConnector": {
                  "color": "{content.border.color}",
                  "size": "2px"
                }
              },
              "togglebutton": {
                "root": {
                  "padding": "0.5rem 1rem",
                  "borderRadius": "{content.border.radius}",
                  "gap": "0.5rem",
                  "fontWeight": "500",
                  "disabledBackground": "{form.field.disabled.background}",
                  "disabledBorderColor": "{form.field.disabled.background}",
                  "disabledColor": "{form.field.disabled.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "icon": {
                  "disabledColor": "{form.field.disabled.color}"
                },
                "content": {
                  "left": "0.25rem",
                  "top": "0.25rem",
                  "checkedShadow": "0px 1px 2px 0px rgba(0, 0, 0, 0.02), 0px 1px 2px 0px rgba(0, 0, 0, 0.04)"
                },
                "colorScheme": {
                  "light": {
                    "root": {
                      "background": "{surface.100}",
                      "checkedBackground": "{surface.100}",
                      "hoverBackground": "{surface.100}",
                      "borderColor": "{surface.100}",
                      "color": "{surface.500}",
                      "hoverColor": "{surface.700}",
                      "checkedColor": "{surface.900}",
                      "checkedBorderColor": "{surface.100}"
                    },
                    "content": {
                      "checkedBackground": "{surface.0}"
                    },
                    "icon": {
                      "color": "{surface.500}",
                      "hoverColor": "{surface.700}",
                      "checkedColor": "{surface.900}"
                    }
                  },
                  "dark": {
                    "root": {
                      "background": "{surface.950}",
                      "checkedBackground": "{surface.950}",
                      "hoverBackground": "{surface.950}",
                      "borderColor": "{surface.950}",
                      "color": "{surface.400}",
                      "hoverColor": "{surface.300}",
                      "checkedColor": "{surface.0}",
                      "checkedBorderColor": "{surface.950}"
                    },
                    "content": {
                      "checkedBackground": "{surface.800}"
                    },
                    "icon": {
                      "color": "{surface.400}",
                      "hoverColor": "{surface.300}",
                      "checkedColor": "{surface.0}"
                    }
                  }
                }
              },
              "toggleswitch": {
                "root": {
                  "width": "2.5rem",
                  "height": "1.5rem",
                  "borderRadius": "30px",
                  "gap": "0.25rem",
                  "shadow": "{form.field.shadow}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  },
                  "borderWidth": "1px",
                  "borderColor": "transparent",
                  "hoverBorderColor": "transparent",
                  "checkedBorderColor": "transparent",
                  "checkedHoverBorderColor": "transparent",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "transitionDuration": "{form.field.transition.duration}",
                  "slideDuration": "0.2s",
                  "disabledBackground": "{form.field.disabled.background}"
                },
                "handle": {
                  "borderRadius": "50%",
                  "size": "1rem",
                  "disabledBackground": "{form.field.disabled.color}"
                },
                "colorScheme": {
                  "light": {
                    "root": {
                      "background": "{surface.300}",
                      "hoverBackground": "{surface.400}",
                      "checkedBackground": "{primary.color}",
                      "checkedHoverBackground": "{primary.hover.color}"
                    },
                    "handle": {
                      "background": "{surface.0}",
                      "hoverBackground": "{surface.0}",
                      "checkedBackground": "{surface.0}",
                      "checkedHoverBackground": "{surface.0}"
                    }
                  },
                  "dark": {
                    "root": {
                      "background": "{surface.700}",
                      "hoverBackground": "{surface.600}",
                      "checkedBackground": "{primary.color}",
                      "checkedHoverBackground": "{primary.hover.color}"
                    },
                    "handle": {
                      "background": "{surface.400}",
                      "hoverBackground": "{surface.300}",
                      "checkedBackground": "{surface.900}",
                      "checkedHoverBackground": "{surface.900}"
                    }
                  }
                }
              },
              "tree": {
                "root": {
                  "background": "{content.background}",
                  "color": "{content.color}",
                  "padding": "1rem",
                  "gap": "2px",
                  "indent": "1rem",
                  "transitionDuration": "{transition.duration}"
                },
                "node": {
                  "padding": "0.25rem 0.5rem",
                  "borderRadius": "{content.border.radius}",
                  "hoverBackground": "{content.hover.background}",
                  "selectedBackground": "{highlight.background}",
                  "color": "{text.color}",
                  "hoverColor": "{text.hover.color}",
                  "selectedColor": "{highlight.color}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "-1px",
                    "shadow": "{focus.ring.shadow}"
                  },
                  "gap": "0.25rem"
                },
                "nodeIcon": {
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.hover.muted.color}",
                  "selectedColor": "{highlight.color}"
                },
                "nodeToggleButton": {
                  "borderRadius": "50%",
                  "size": "1.75rem",
                  "hoverBackground": "{content.hover.background}",
                  "selectedHoverBackground": "{content.background}",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.hover.muted.color}",
                  "selectedHoverColor": "{primary.color}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "loadingIcon": {
                  "size": "2rem"
                }
              },
              "treeselect": {
                "root": {
                  "background": "{form.field.background}",
                  "disabledBackground": "{form.field.disabled.background}",
                  "filledBackground": "{form.field.filled.background}",
                  "filledFocusBackground": "{form.field.filled.focus.background}",
                  "borderColor": "{form.field.border.color}",
                  "hoverBorderColor": "{form.field.hover.border.color}",
                  "focusBorderColor": "{form.field.focus.border.color}",
                  "invalidBorderColor": "{form.field.invalid.border.color}",
                  "color": "{form.field.color}",
                  "disabledColor": "{form.field.disabled.color}",
                  "placeholderColor": "{form.field.placeholder.color}",
                  "shadow": "{form.field.shadow}",
                  "paddingX": "{form.field.padding.x}",
                  "paddingY": "{form.field.padding.y}",
                  "borderRadius": "{form.field.border.radius}",
                  "focusRing": {
                    "width": "{form.field.focus.ring.width}",
                    "style": "{form.field.focus.ring.style}",
                    "color": "{form.field.focus.ring.color}",
                    "offset": "{form.field.focus.ring.offset}",
                    "shadow": "{form.field.focus.ring.shadow}"
                  },
                  "transitionDuration": "{form.field.transition.duration}"
                },
                "dropdown": {
                  "width": "2.5rem",
                  "color": "{form.field.icon.color}"
                },
                "overlay": {
                  "background": "{overlay.select.background}",
                  "borderColor": "{overlay.select.border.color}",
                  "borderRadius": "{overlay.select.border.radius}",
                  "color": "{overlay.select.color}",
                  "shadow": "{overlay.select.shadow}"
                },
                "tree": {
                  "padding": "{list.padding}"
                },
                "emptyMessage": {
                  "padding": "{list.option.padding}"
                },
                "chip": {
                  "borderRadius": "{border.radius.sm}"
                }
              },
              "treetable": {
                "root": {
                  "transitionDuration": "{transition.duration}"
                },
                "header": {
                  "background": "{content.background}",
                  "borderColor": "{treetable.border.color}",
                  "color": "{content.color}",
                  "borderWidth": "0 0 1px 0",
                  "padding": "0.75rem 1rem"
                },
                "headerCell": {
                  "background": "{content.background}",
                  "hoverBackground": "{content.hover.background}",
                  "selectedBackground": "{highlight.background}",
                  "borderColor": "{treetable.border.color}",
                  "color": "{content.color}",
                  "hoverColor": "{content.hover.color}",
                  "selectedColor": "{highlight.color}",
                  "gap": "0.5rem",
                  "padding": "0.75rem 1rem",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "-1px",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "columnTitle": {
                  "fontWeight": "600"
                },
                "row": {
                  "background": "{content.background}",
                  "hoverBackground": "{content.hover.background}",
                  "selectedBackground": "{highlight.background}",
                  "color": "{content.color}",
                  "hoverColor": "{content.hover.color}",
                  "selectedColor": "{highlight.color}",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "-1px",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "bodyCell": {
                  "borderColor": "{treetable.border.color}",
                  "padding": "0.75rem 1rem",
                  "gap": "0.5rem"
                },
                "footerCell": {
                  "background": "{content.background}",
                  "borderColor": "{treetable.border.color}",
                  "color": "{content.color}",
                  "padding": "0.75rem 1rem"
                },
                "columnFooter": {
                  "fontWeight": "600"
                },
                "footer": {
                  "background": "{content.background}",
                  "borderColor": "{treetable.border.color}",
                  "color": "{content.color}",
                  "borderWidth": "0 0 1px 0",
                  "padding": "0.75rem 1rem"
                },
                "columnResizerWidth": "0.5rem",
                "resizeIndicator": {
                  "width": "1px",
                  "color": "{primary.color}"
                },
                "sortIcon": {
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.hover.muted.color}"
                },
                "loadingIcon": {
                  "size": "2rem"
                },
                "nodeToggleButton": {
                  "hoverBackground": "{content.hover.background}",
                  "selectedHoverBackground": "{content.background}",
                  "color": "{text.muted.color}",
                  "hoverColor": "{text.color}",
                  "selectedHoverColor": "{primary.color}",
                  "size": "1.75rem",
                  "borderRadius": "50%",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "color": "{focus.ring.color}",
                    "offset": "{focus.ring.offset}",
                    "shadow": "{focus.ring.shadow}"
                  }
                },
                "paginatorTop": {
                  "borderColor": "{content.border.color}",
                  "borderWidth": "0 0 1px 0"
                },
                "paginatorBottom": {
                  "borderColor": "{content.border.color}",
                  "borderWidth": "0 0 1px 0"
                },
                "colorScheme": {
                  "light": {
                    "root": {
                      "borderColor": "{content.border.color}"
                    },
                    "bodyCell": {
                      "selectedBorderColor": "{primary.100}"
                    }
                  },
                  "dark": {
                    "root": {
                      "borderColor": "{surface.800}"
                    },
                    "bodyCell": {
                      "selectedBorderColor": "{primary.900}"
                    }
                  }
                }
              },
              "toast": {
                "root": {
                  "width": "25rem",
                  "borderRadius": "{content.border.radius}",
                  "borderWidth": "1px",
                  "transitionDuration": "{transition.duration}"
                },
                "icon": {
                  "size": "1.125rem"
                },
                "content": {
                  "padding": "{overlay.popover.padding}",
                  "gap": "0.5rem"
                },
                "text": {
                  "gap": "0.5rem"
                },
                "summary": {
                  "fontWeight": "500",
                  "fontSize": "1rem"
                },
                "detail": {
                  "fontWeight": "500",
                  "fontSize": "0.875rem"
                },
                "closeButton": {
                  "width": "1.75rem",
                  "height": "1.75rem",
                  "borderRadius": "50%",
                  "focusRing": {
                    "width": "{focus.ring.width}",
                    "style": "{focus.ring.style}",
                    "offset": "{focus.ring.offset}"
                  }
                },
                "closeIcon": {
                  "size": "1rem"
                },
                "colorScheme": {
                  "light": {
                    "blur": "1.5px",
                    "info": {
                      "background": "color-mix(in srgb, {blue.50}, transparent 5%)",
                      "borderColor": "{blue.200}",
                      "color": "{blue.600}",
                      "detailColor": "{surface.700}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{blue.100}",
                        "focusRing": {
                          "color": "{blue.600}",
                          "shadow": "none"
                        }
                      }
                    },
                    "success": {
                      "background": "color-mix(in srgb, {green.50}, transparent 5%)",
                      "borderColor": "{green.200}",
                      "color": "{green.600}",
                      "detailColor": "{surface.700}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{green.100}",
                        "focusRing": {
                          "color": "{green.600}",
                          "shadow": "none"
                        }
                      }
                    },
                    "warn": {
                      "background": "color-mix(in srgb,{yellow.50}, transparent 5%)",
                      "borderColor": "{yellow.200}",
                      "color": "{yellow.600}",
                      "detailColor": "{surface.700}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{yellow.100}",
                        "focusRing": {
                          "color": "{yellow.600}",
                          "shadow": "none"
                        }
                      }
                    },
                    "error": {
                      "background": "color-mix(in srgb, {red.50}, transparent 5%)",
                      "borderColor": "{red.200}",
                      "color": "{red.600}",
                      "detailColor": "{surface.700}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{red.100}",
                        "focusRing": {
                          "color": "{red.600}",
                          "shadow": "none"
                        }
                      }
                    },
                    "secondary": {
                      "background": "{surface.100}",
                      "borderColor": "{surface.200}",
                      "color": "{surface.600}",
                      "detailColor": "{surface.700}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{surface.200}",
                        "focusRing": {
                          "color": "{surface.600}",
                          "shadow": "none"
                        }
                      }
                    },
                    "contrast": {
                      "background": "{surface.900}",
                      "borderColor": "{surface.950}",
                      "color": "{surface.50}",
                      "detailColor": "{surface.0}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{surface.800}",
                        "focusRing": {
                          "color": "{surface.50}",
                          "shadow": "none"
                        }
                      }
                    }
                  },
                  "dark": {
                    "blur": "10px",
                    "info": {
                      "background": "color-mix(in srgb, {blue.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {blue.700}, transparent 64%)",
                      "color": "{blue.500}",
                      "detailColor": "{surface.0}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "rgba(255, 255, 255, 0.05)",
                        "focusRing": {
                          "color": "{blue.500}",
                          "shadow": "none"
                        }
                      }
                    },
                    "success": {
                      "background": "color-mix(in srgb, {green.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {green.700}, transparent 64%)",
                      "color": "{green.500}",
                      "detailColor": "{surface.0}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "rgba(255, 255, 255, 0.05)",
                        "focusRing": {
                          "color": "{green.500}",
                          "shadow": "none"
                        }
                      }
                    },
                    "warn": {
                      "background": "color-mix(in srgb, {yellow.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {yellow.700}, transparent 64%)",
                      "color": "{yellow.500}",
                      "detailColor": "{surface.0}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "rgba(255, 255, 255, 0.05)",
                        "focusRing": {
                          "color": "{yellow.500}",
                          "shadow": "none"
                        }
                      }
                    },
                    "error": {
                      "background": "color-mix(in srgb, {red.500}, transparent 84%)",
                      "borderColor": "color-mix(in srgb, {red.700}, transparent 64%)",
                      "color": "{red.500}",
                      "detailColor": "{surface.0}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "rgba(255, 255, 255, 0.05)",
                        "focusRing": {
                          "color": "{red.500}",
                          "shadow": "none"
                        }
                      }
                    },
                    "secondary": {
                      "background": "{surface.800}",
                      "borderColor": "{surface.700}",
                      "color": "{surface.300}",
                      "detailColor": "{surface.0}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{surface.700}",
                        "focusRing": {
                          "color": "{surface.300}",
                          "shadow": "none"
                        }
                      }
                    },
                    "contrast": {
                      "background": "{surface.0}",
                      "borderColor": "{surface.100}",
                      "color": "{surface.950}",
                      "detailColor": "{surface.950}",
                      "shadow": "0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)",
                      "closeButton": {
                        "hoverBackground": "{surface.100}",
                        "focusRing": {
                          "color": "{surface.950}",
                          "shadow": "none"
                        }
                      }
                    }
                  }
                }
              },
              "toolbar": {
                "root": {
                  "background": "{content.background}",
                  "borderColor": "{content.border.color}",
                  "borderRadius": "{content.border.radius}",
                  "color": "{content.color}",
                  "gap": "0.5rem",
                  "padding": "0.75rem"
                }
              },
              "virtualscroller": {
                "loader": {
                  "mask": {
                    "background": "{content.background}",
                    "color": "{text.muted.color}"
                  },
                  "icon": {
                    "size": "2rem"
                  }
                }
              }
            },
            "directives": {
              "tooltip": {
                "root": {
                  "maxWidth": "12.5rem",
                  "gutter": "0.25rem",
                  "shadow": "{overlay.popover.shadow}",
                  "padding": "0.5rem 0.75rem",
                  "borderRadius": "{overlay.popover.border.radius}"
                },
                "colorScheme": {
                  "light": {
                    "root": {
                      "background": "{surface.700}",
                      "color": "{surface.0}"
                    }
                  },
                  "dark": {
                    "root": {
                      "background": "{surface.700}",
                      "color": "{surface.0}"
                    }
                  }
                }
              },
              "ripple": {
                "colorScheme": {
                  "light": {
                    "root": {
                      "background": "rgba(0,0,0,0.1)"
                    }
                  },
                  "dark": {
                    "root": {
                      "background": "rgba(255,255,255,0.3)"
                    }
                  }
                }
              }
            }
          },
          "options": {
            "darkModeSelector": ".my-app-dark"
          }
        }
      },
      "components": [
        {
          "name": "AutoComplete",
          "as": "AutoComplete",
          "from": "primevue/autocomplete",
          "export": "default",
          "filePath": "primevue/autocomplete",
          "global": true
        },
        {
          "name": "Calendar",
          "as": "Calendar",
          "from": "primevue/calendar",
          "export": "default",
          "filePath": "primevue/calendar",
          "global": true
        },
        {
          "name": "CascadeSelect",
          "as": "CascadeSelect",
          "from": "primevue/cascadeselect",
          "export": "default",
          "filePath": "primevue/cascadeselect",
          "global": true
        },
        {
          "name": "Checkbox",
          "as": "Checkbox",
          "from": "primevue/checkbox",
          "export": "default",
          "filePath": "primevue/checkbox",
          "global": true
        },
        {
          "name": "Chips",
          "as": "Chips",
          "from": "primevue/chips",
          "export": "default",
          "filePath": "primevue/chips",
          "global": true
        },
        {
          "name": "ColorPicker",
          "as": "ColorPicker",
          "from": "primevue/colorpicker",
          "export": "default",
          "filePath": "primevue/colorpicker",
          "global": true
        },
        {
          "name": "DatePicker",
          "as": "DatePicker",
          "from": "primevue/datepicker",
          "export": "default",
          "filePath": "primevue/datepicker",
          "global": true
        },
        {
          "name": "Dropdown",
          "as": "Dropdown",
          "from": "primevue/dropdown",
          "export": "default",
          "filePath": "primevue/dropdown",
          "global": true
        },
        {
          "name": "Editor",
          "as": "Editor",
          "from": "primevue/editor",
          "export": "default",
          "filePath": "primevue/editor",
          "global": true
        },
        {
          "name": "FloatLabel",
          "as": "FloatLabel",
          "from": "primevue/floatlabel",
          "export": "default",
          "filePath": "primevue/floatlabel",
          "global": true
        },
        {
          "name": "Fluid",
          "as": "Fluid",
          "from": "primevue/fluid",
          "export": "default",
          "filePath": "primevue/fluid",
          "global": true
        },
        {
          "name": "IconField",
          "as": "IconField",
          "from": "primevue/iconfield",
          "export": "default",
          "filePath": "primevue/iconfield",
          "global": true
        },
        {
          "name": "InputChips",
          "as": "InputChips",
          "from": "primevue/inputchips",
          "export": "default",
          "filePath": "primevue/inputchips",
          "global": true
        },
        {
          "name": "InputGroup",
          "as": "InputGroup",
          "from": "primevue/inputgroup",
          "export": "default",
          "filePath": "primevue/inputgroup",
          "global": true
        },
        {
          "name": "InputGroupAddon",
          "as": "InputGroupAddon",
          "from": "primevue/inputgroupaddon",
          "export": "default",
          "filePath": "primevue/inputgroupaddon",
          "global": true
        },
        {
          "name": "InputIcon",
          "as": "InputIcon",
          "from": "primevue/inputicon",
          "export": "default",
          "filePath": "primevue/inputicon",
          "global": true
        },
        {
          "name": "InputMask",
          "as": "InputMask",
          "from": "primevue/inputmask",
          "export": "default",
          "filePath": "primevue/inputmask",
          "global": true
        },
        {
          "name": "InputNumber",
          "as": "InputNumber",
          "from": "primevue/inputnumber",
          "export": "default",
          "filePath": "primevue/inputnumber",
          "global": true
        },
        {
          "name": "InputOtp",
          "as": "InputOtp",
          "from": "primevue/inputotp",
          "export": "default",
          "filePath": "primevue/inputotp",
          "global": true
        },
        {
          "name": "InputSwitch",
          "as": "InputSwitch",
          "from": "primevue/inputswitch",
          "export": "default",
          "filePath": "primevue/inputswitch",
          "global": true
        },
        {
          "name": "InputText",
          "as": "InputText",
          "from": "primevue/inputtext",
          "export": "default",
          "filePath": "primevue/inputtext",
          "global": true
        },
        {
          "name": "Knob",
          "as": "Knob",
          "from": "primevue/knob",
          "export": "default",
          "filePath": "primevue/knob",
          "global": true
        },
        {
          "name": "Listbox",
          "as": "Listbox",
          "from": "primevue/listbox",
          "export": "default",
          "filePath": "primevue/listbox",
          "global": true
        },
        {
          "name": "MultiSelect",
          "as": "MultiSelect",
          "from": "primevue/multiselect",
          "export": "default",
          "filePath": "primevue/multiselect",
          "global": true
        },
        {
          "name": "Password",
          "as": "Password",
          "from": "primevue/password",
          "export": "default",
          "filePath": "primevue/password",
          "global": true
        },
        {
          "name": "RadioButton",
          "as": "RadioButton",
          "from": "primevue/radiobutton",
          "export": "default",
          "filePath": "primevue/radiobutton",
          "global": true
        },
        {
          "name": "Rating",
          "as": "Rating",
          "from": "primevue/rating",
          "export": "default",
          "filePath": "primevue/rating",
          "global": true
        },
        {
          "name": "Select",
          "as": "Select",
          "from": "primevue/select",
          "export": "default",
          "filePath": "primevue/select",
          "global": true
        },
        {
          "name": "SelectButton",
          "as": "SelectButton",
          "from": "primevue/selectbutton",
          "export": "default",
          "filePath": "primevue/selectbutton",
          "global": true
        },
        {
          "name": "Slider",
          "as": "Slider",
          "from": "primevue/slider",
          "export": "default",
          "filePath": "primevue/slider",
          "global": true
        },
        {
          "name": "Textarea",
          "as": "Textarea",
          "from": "primevue/textarea",
          "export": "default",
          "filePath": "primevue/textarea",
          "global": true
        },
        {
          "name": "ToggleButton",
          "as": "ToggleButton",
          "from": "primevue/togglebutton",
          "export": "default",
          "filePath": "primevue/togglebutton",
          "global": true
        },
        {
          "name": "ToggleSwitch",
          "as": "ToggleSwitch",
          "from": "primevue/toggleswitch",
          "export": "default",
          "filePath": "primevue/toggleswitch",
          "global": true
        },
        {
          "name": "TreeSelect",
          "as": "TreeSelect",
          "from": "primevue/treeselect",
          "export": "default",
          "filePath": "primevue/treeselect",
          "global": true
        },
        {
          "name": "Button",
          "as": "Button",
          "from": "primevue/button",
          "export": "default",
          "filePath": "primevue/button",
          "global": true
        },
        {
          "name": "ButtonGroup",
          "as": "ButtonGroup",
          "from": "primevue/buttongroup",
          "export": "default",
          "filePath": "primevue/buttongroup",
          "global": true
        },
        {
          "name": "SpeedDial",
          "as": "SpeedDial",
          "from": "primevue/speeddial",
          "export": "default",
          "filePath": "primevue/speeddial",
          "global": true
        },
        {
          "name": "SplitButton",
          "as": "SplitButton",
          "from": "primevue/splitbutton",
          "export": "default",
          "filePath": "primevue/splitbutton",
          "global": true
        },
        {
          "name": "Column",
          "as": "Column",
          "from": "primevue/column",
          "export": "default",
          "filePath": "primevue/column",
          "global": true
        },
        {
          "name": "Row",
          "as": "Row",
          "from": "primevue/row",
          "export": "default",
          "filePath": "primevue/row",
          "global": true
        },
        {
          "name": "ColumnGroup",
          "as": "ColumnGroup",
          "from": "primevue/columngroup",
          "export": "default",
          "filePath": "primevue/columngroup",
          "global": true
        },
        {
          "name": "DataTable",
          "as": "DataTable",
          "from": "primevue/datatable",
          "export": "default",
          "filePath": "primevue/datatable",
          "global": true
        },
        {
          "name": "DataView",
          "as": "DataView",
          "from": "primevue/dataview",
          "export": "default",
          "filePath": "primevue/dataview",
          "global": true
        },
        {
          "name": "OrderList",
          "as": "OrderList",
          "from": "primevue/orderlist",
          "export": "default",
          "filePath": "primevue/orderlist",
          "global": true
        },
        {
          "name": "OrganizationChart",
          "as": "OrganizationChart",
          "from": "primevue/organizationchart",
          "export": "default",
          "filePath": "primevue/organizationchart",
          "global": true
        },
        {
          "name": "Paginator",
          "as": "Paginator",
          "from": "primevue/paginator",
          "export": "default",
          "filePath": "primevue/paginator",
          "global": true
        },
        {
          "name": "PickList",
          "as": "PickList",
          "from": "primevue/picklist",
          "export": "default",
          "filePath": "primevue/picklist",
          "global": true
        },
        {
          "name": "Tree",
          "as": "Tree",
          "from": "primevue/tree",
          "export": "default",
          "filePath": "primevue/tree",
          "global": true
        },
        {
          "name": "TreeTable",
          "as": "TreeTable",
          "from": "primevue/treetable",
          "export": "default",
          "filePath": "primevue/treetable",
          "global": true
        },
        {
          "name": "Timeline",
          "as": "Timeline",
          "from": "primevue/timeline",
          "export": "default",
          "filePath": "primevue/timeline",
          "global": true
        },
        {
          "name": "VirtualScroller",
          "as": "VirtualScroller",
          "from": "primevue/virtualscroller",
          "export": "default",
          "filePath": "primevue/virtualscroller",
          "global": true
        },
        {
          "name": "Accordion",
          "as": "Accordion",
          "from": "primevue/accordion",
          "export": "default",
          "filePath": "primevue/accordion",
          "global": true
        },
        {
          "name": "AccordionPanel",
          "as": "AccordionPanel",
          "from": "primevue/accordionpanel",
          "export": "default",
          "filePath": "primevue/accordionpanel",
          "global": true
        },
        {
          "name": "AccordionHeader",
          "as": "AccordionHeader",
          "from": "primevue/accordionheader",
          "export": "default",
          "filePath": "primevue/accordionheader",
          "global": true
        },
        {
          "name": "AccordionContent",
          "as": "AccordionContent",
          "from": "primevue/accordioncontent",
          "export": "default",
          "filePath": "primevue/accordioncontent",
          "global": true
        },
        {
          "name": "AccordionTab",
          "as": "AccordionTab",
          "from": "primevue/accordiontab",
          "export": "default",
          "filePath": "primevue/accordiontab",
          "global": true
        },
        {
          "name": "Card",
          "as": "Card",
          "from": "primevue/card",
          "export": "default",
          "filePath": "primevue/card",
          "global": true
        },
        {
          "name": "DeferredContent",
          "as": "DeferredContent",
          "from": "primevue/deferredcontent",
          "export": "default",
          "filePath": "primevue/deferredcontent",
          "global": true
        },
        {
          "name": "Divider",
          "as": "Divider",
          "from": "primevue/divider",
          "export": "default",
          "filePath": "primevue/divider",
          "global": true
        },
        {
          "name": "Fieldset",
          "as": "Fieldset",
          "from": "primevue/fieldset",
          "export": "default",
          "filePath": "primevue/fieldset",
          "global": true
        },
        {
          "name": "Panel",
          "as": "Panel",
          "from": "primevue/panel",
          "export": "default",
          "filePath": "primevue/panel",
          "global": true
        },
        {
          "name": "ScrollPanel",
          "as": "ScrollPanel",
          "from": "primevue/scrollpanel",
          "export": "default",
          "filePath": "primevue/scrollpanel",
          "global": true
        },
        {
          "name": "Splitter",
          "as": "Splitter",
          "from": "primevue/splitter",
          "export": "default",
          "filePath": "primevue/splitter",
          "global": true
        },
        {
          "name": "SplitterPanel",
          "as": "SplitterPanel",
          "from": "primevue/splitterpanel",
          "export": "default",
          "filePath": "primevue/splitterpanel",
          "global": true
        },
        {
          "name": "Stepper",
          "as": "Stepper",
          "from": "primevue/stepper",
          "export": "default",
          "filePath": "primevue/stepper",
          "global": true
        },
        {
          "name": "StepList",
          "as": "StepList",
          "from": "primevue/steplist",
          "export": "default",
          "filePath": "primevue/steplist",
          "global": true
        },
        {
          "name": "Step",
          "as": "Step",
          "from": "primevue/step",
          "export": "default",
          "filePath": "primevue/step",
          "global": true
        },
        {
          "name": "StepItem",
          "as": "StepItem",
          "from": "primevue/stepitem",
          "export": "default",
          "filePath": "primevue/stepitem",
          "global": true
        },
        {
          "name": "StepPanels",
          "as": "StepPanels",
          "from": "primevue/steppanels",
          "export": "default",
          "filePath": "primevue/steppanels",
          "global": true
        },
        {
          "name": "StepPanel",
          "as": "StepPanel",
          "from": "primevue/steppanel",
          "export": "default",
          "filePath": "primevue/steppanel",
          "global": true
        },
        {
          "name": "TabView",
          "as": "TabView",
          "from": "primevue/tabview",
          "export": "default",
          "filePath": "primevue/tabview",
          "global": true
        },
        {
          "name": "Tabs",
          "as": "Tabs",
          "from": "primevue/tabs",
          "export": "default",
          "filePath": "primevue/tabs",
          "global": true
        },
        {
          "name": "TabList",
          "as": "TabList",
          "from": "primevue/tablist",
          "export": "default",
          "filePath": "primevue/tablist",
          "global": true
        },
        {
          "name": "Tab",
          "as": "Tab",
          "from": "primevue/tab",
          "export": "default",
          "filePath": "primevue/tab",
          "global": true
        },
        {
          "name": "TabPanels",
          "as": "TabPanels",
          "from": "primevue/tabpanels",
          "export": "default",
          "filePath": "primevue/tabpanels",
          "global": true
        },
        {
          "name": "TabPanel",
          "as": "TabPanel",
          "from": "primevue/tabpanel",
          "export": "default",
          "filePath": "primevue/tabpanel",
          "global": true
        },
        {
          "name": "Toolbar",
          "as": "Toolbar",
          "from": "primevue/toolbar",
          "export": "default",
          "filePath": "primevue/toolbar",
          "global": true
        },
        {
          "name": "ConfirmDialog",
          "use": {
            "as": "ConfirmationService"
          },
          "as": "ConfirmDialog",
          "from": "primevue/confirmdialog",
          "export": "default",
          "filePath": "primevue/confirmdialog",
          "global": true
        },
        {
          "name": "ConfirmPopup",
          "use": {
            "as": "ConfirmationService"
          },
          "as": "ConfirmPopup",
          "from": "primevue/confirmpopup",
          "export": "default",
          "filePath": "primevue/confirmpopup",
          "global": true
        },
        {
          "name": "Dialog",
          "as": "Dialog",
          "from": "primevue/dialog",
          "export": "default",
          "filePath": "primevue/dialog",
          "global": true
        },
        {
          "name": "Drawer",
          "as": "Drawer",
          "from": "primevue/drawer",
          "export": "default",
          "filePath": "primevue/drawer",
          "global": true
        },
        {
          "name": "DynamicDialog",
          "use": {
            "as": "DialogService"
          },
          "as": "DynamicDialog",
          "from": "primevue/dynamicdialog",
          "export": "default",
          "filePath": "primevue/dynamicdialog",
          "global": true
        },
        {
          "name": "OverlayPanel",
          "as": "OverlayPanel",
          "from": "primevue/overlaypanel",
          "export": "default",
          "filePath": "primevue/overlaypanel",
          "global": true
        },
        {
          "name": "Popover",
          "as": "Popover",
          "from": "primevue/popover",
          "export": "default",
          "filePath": "primevue/popover",
          "global": true
        },
        {
          "name": "Sidebar",
          "as": "Sidebar",
          "from": "primevue/sidebar",
          "export": "default",
          "filePath": "primevue/sidebar",
          "global": true
        },
        {
          "name": "FileUpload",
          "as": "FileUpload",
          "from": "primevue/fileupload",
          "export": "default",
          "filePath": "primevue/fileupload",
          "global": true
        },
        {
          "name": "Breadcrumb",
          "as": "Breadcrumb",
          "from": "primevue/breadcrumb",
          "export": "default",
          "filePath": "primevue/breadcrumb",
          "global": true
        },
        {
          "name": "ContextMenu",
          "as": "ContextMenu",
          "from": "primevue/contextmenu",
          "export": "default",
          "filePath": "primevue/contextmenu",
          "global": true
        },
        {
          "name": "Dock",
          "as": "Dock",
          "from": "primevue/dock",
          "export": "default",
          "filePath": "primevue/dock",
          "global": true
        },
        {
          "name": "Menu",
          "as": "Menu",
          "from": "primevue/menu",
          "export": "default",
          "filePath": "primevue/menu",
          "global": true
        },
        {
          "name": "Menubar",
          "as": "Menubar",
          "from": "primevue/menubar",
          "export": "default",
          "filePath": "primevue/menubar",
          "global": true
        },
        {
          "name": "MegaMenu",
          "as": "MegaMenu",
          "from": "primevue/megamenu",
          "export": "default",
          "filePath": "primevue/megamenu",
          "global": true
        },
        {
          "name": "PanelMenu",
          "as": "PanelMenu",
          "from": "primevue/panelmenu",
          "export": "default",
          "filePath": "primevue/panelmenu",
          "global": true
        },
        {
          "name": "Steps",
          "as": "Steps",
          "from": "primevue/steps",
          "export": "default",
          "filePath": "primevue/steps",
          "global": true
        },
        {
          "name": "TabMenu",
          "as": "TabMenu",
          "from": "primevue/tabmenu",
          "export": "default",
          "filePath": "primevue/tabmenu",
          "global": true
        },
        {
          "name": "TieredMenu",
          "as": "TieredMenu",
          "from": "primevue/tieredmenu",
          "export": "default",
          "filePath": "primevue/tieredmenu",
          "global": true
        },
        {
          "name": "Chart",
          "as": "Chart",
          "from": "primevue/chart",
          "export": "default",
          "filePath": "primevue/chart",
          "global": true
        },
        {
          "name": "Message",
          "as": "Message",
          "from": "primevue/message",
          "export": "default",
          "filePath": "primevue/message",
          "global": true
        },
        {
          "name": "InlineMessage",
          "as": "InlineMessage",
          "from": "primevue/inlinemessage",
          "export": "default",
          "filePath": "primevue/inlinemessage",
          "global": true
        },
        {
          "name": "Toast",
          "use": {
            "as": "ToastService"
          },
          "as": "Toast",
          "from": "primevue/toast",
          "export": "default",
          "filePath": "primevue/toast",
          "global": true
        },
        {
          "name": "Image",
          "as": "Image",
          "from": "primevue/image",
          "export": "default",
          "filePath": "primevue/image",
          "global": true
        },
        {
          "name": "Avatar",
          "as": "Avatar",
          "from": "primevue/avatar",
          "export": "default",
          "filePath": "primevue/avatar",
          "global": true
        },
        {
          "name": "AvatarGroup",
          "as": "AvatarGroup",
          "from": "primevue/avatargroup",
          "export": "default",
          "filePath": "primevue/avatargroup",
          "global": true
        },
        {
          "name": "Badge",
          "as": "Badge",
          "from": "primevue/badge",
          "export": "default",
          "filePath": "primevue/badge",
          "global": true
        },
        {
          "name": "BlockUI",
          "as": "BlockUI",
          "from": "primevue/blockui",
          "export": "default",
          "filePath": "primevue/blockui",
          "global": true
        },
        {
          "name": "Chip",
          "as": "Chip",
          "from": "primevue/chip",
          "export": "default",
          "filePath": "primevue/chip",
          "global": true
        },
        {
          "name": "Inplace",
          "as": "Inplace",
          "from": "primevue/inplace",
          "export": "default",
          "filePath": "primevue/inplace",
          "global": true
        },
        {
          "name": "MeterGroup",
          "as": "MeterGroup",
          "from": "primevue/metergroup",
          "export": "default",
          "filePath": "primevue/metergroup",
          "global": true
        },
        {
          "name": "OverlayBadge",
          "as": "OverlayBadge",
          "from": "primevue/overlaybadge",
          "export": "default",
          "filePath": "primevue/overlaybadge",
          "global": true
        },
        {
          "name": "ScrollTop",
          "as": "ScrollTop",
          "from": "primevue/scrolltop",
          "export": "default",
          "filePath": "primevue/scrolltop",
          "global": true
        },
        {
          "name": "Skeleton",
          "as": "Skeleton",
          "from": "primevue/skeleton",
          "export": "default",
          "filePath": "primevue/skeleton",
          "global": true
        },
        {
          "name": "ProgressBar",
          "as": "ProgressBar",
          "from": "primevue/progressbar",
          "export": "default",
          "filePath": "primevue/progressbar",
          "global": true
        },
        {
          "name": "ProgressSpinner",
          "as": "ProgressSpinner",
          "from": "primevue/progressspinner",
          "export": "default",
          "filePath": "primevue/progressspinner",
          "global": true
        },
        {
          "name": "Tag",
          "as": "Tag",
          "from": "primevue/tag",
          "export": "default",
          "filePath": "primevue/tag",
          "global": true
        },
        {
          "name": "Terminal",
          "as": "Terminal",
          "from": "primevue/terminal",
          "export": "default",
          "filePath": "primevue/terminal",
          "global": true
        }
      ],
      "directives": [
        {
          "name": "badge",
          "as": "BadgeDirective",
          "from": "primevue/badgedirective"
        },
        {
          "name": "tooltip",
          "as": "Tooltip",
          "from": "primevue/tooltip"
        },
        {
          "name": "ripple",
          "as": "Ripple",
          "from": "primevue/ripple"
        },
        {
          "name": "styleclass",
          "as": "StyleClass",
          "from": "primevue/styleclass"
        },
        {
          "name": "focustrap",
          "as": "FocusTrap",
          "from": "primevue/focustrap"
        },
        {
          "name": "animateonscroll",
          "as": "AnimateOnScroll",
          "from": "primevue/animateonscroll"
        }
      ],
      "composables": [
        {
          "name": "usePrimeVue",
          "as": "usePrimeVue",
          "from": "primevue/config"
        },
        {
          "name": "useStyle",
          "as": "useStyle",
          "from": "primevue/usestyle"
        },
        {
          "name": "useConfirm",
          "as": "useConfirm",
          "from": "primevue/useconfirm"
        },
        {
          "name": "useToast",
          "as": "useToast",
          "from": "primevue/usetoast"
        },
        {
          "name": "useDialog",
          "as": "useDialog",
          "from": "primevue/usedialog"
        }
      ],
      "config": [
        {
          "name": "PrimeVue",
          "as": "PrimeVue",
          "from": "primevue/config"
        }
      ],
      "services": [
        {
          "name": "ConfirmationService",
          "as": "ConfirmationService",
          "from": "primevue/confirmationservice"
        },
        {
          "name": "DialogService",
          "as": "DialogService",
          "from": "primevue/dialogservice"
        },
        {
          "name": "ToastService",
          "as": "ToastService",
          "from": "primevue/toastservice"
        }
      ],
      "styles": [
        {
          "name": "BaseStyle",
          "as": "BaseStyle",
          "from": "@primevue/core/base/style"
        }
      ],
      "injectStylesAsString": [],
      "injectStylesAsStringToTop": [
        ""
      ]
    },
    "persistedState": {
      "storage": "localStorage",
      "debug": false,
      "cookieOptions": {}
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
function checkBufferSupport() {
  if (typeof Buffer === void 0) {
    throw new TypeError("[unstorage] Buffer is not supported!");
  }
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  checkBufferSupport();
  const base64 = Buffer.from(value).toString("base64");
  return BASE64_PREFIX + base64;
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  checkBufferSupport();
  return Buffer.from(value.slice(BASE64_PREFIX.length), "base64");
}

const storageKeyProperties = [
  "hasItem",
  "getItem",
  "getItemRaw",
  "setItem",
  "setItemRaw",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$1 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$1,
    options: {},
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return Array.from(data.keys());
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      for (const mount of mounts) {
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        const keys = rawKeys.map((key) => mount.mountpoint + normalizeKey$1(key)).filter((key) => !maskedMounts.some((p) => key.startsWith(p)));
        allKeys.push(...keys);
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      return base ? allKeys.filter((key) => key.startsWith(base) && !key.endsWith("$")) : allKeys.filter((key) => !key.endsWith("$"));
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    }
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0].replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        const dirFiles = await readdirRecursive(entryPath, ignore);
        files.push(...dirFiles.map((f) => entry.name + "/" + f));
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$1(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.\:|\.\.$/;
const DRIVER_NAME = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME, "base");
  }
  opts.base = resolve$1(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME,
    options: opts,
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys() {
      return readdirRecursive(r("."), opts.ignore);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"D:\\Projects\\bgs-riset\\.data\\kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[nitro] [cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          const promise = useStorage().setItem(cacheKey, entry).catch((error) => {
            console.error(`[nitro] [cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event && event.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[nitro] [cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length > 0 ? hash(args, {}) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      const _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        variableHeaders[header] = incomingEvent.node.req.headers[header];
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            for (const header in headers2) {
              this.setHeader(header, headers2[header]);
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(event);
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        event.node.res.setHeader(name, value);
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function normalizeError(error) {
  const cwd = typeof process.cwd === "function" ? process.cwd() : "/";
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}
function _captureError(error, type) {
  console.error(`[nitro] [${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

const config$1 = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config$1.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

var theme$j = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-avatar {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: ".concat(dt('avatar.width'), ";\n    height: ").concat(dt('avatar.height'), ";\n    font-size: ").concat(dt('avatar.font.size'), ";\n    background: ").concat(dt('avatar.background'), ";\n    border-radius: ").concat(dt('avatar.border.radius'), ";\n}\n\n.p-avatar-image {\n    background: transparent;\n}\n\n.p-avatar-circle {\n    border-radius: 50%;\n}\n\n.p-avatar-circle img {\n    border-radius: 50%;\n}\n\n.p-avatar-icon {\n    font-size: ").concat(dt('avatar.font.size'), ";\n}\n\n.p-avatar img {\n    width: 100%;\n    height: 100%;\n}\n\n.p-avatar-lg {\n    width: ").concat(dt('avatar.lg.width'), ";\n    height: ").concat(dt('avatar.lg.width'), ";\n    font-size: ").concat(dt('avatar.lg.font.size'), ";\n}\n\n.p-avatar-lg .p-avatar-icon {\n    font-size: ").concat(dt('avatar.lg.font.size'), ";\n}\n\n.p-avatar-xl {\n    width: ").concat(dt('avatar.xl.width'), ";\n    height: ").concat(dt('avatar.xl.width'), ";\n    font-size: ").concat(dt('avatar.xl.font.size'), ";\n}\n\n.p-avatar-xl .p-avatar-icon {\n    font-size: ").concat(dt('avatar.xl.font.size'), ";\n}\n\n.p-avatar-group {\n    display: flex;\n    align-items: center;\n}\n\n.p-avatar-group .p-avatar + .p-avatar {\n    margin-left: ").concat(dt('avatar.group.offset'), ";\n}\n\n.p-avatar-group .p-avatar {\n    border: 2px solid ").concat(dt('avatar.group.border.color'), ";\n}\n");
};
var classes$k = {
  root: function root(_ref2) {
    var props = _ref2.props;
    return ['p-avatar p-component', {
      'p-avatar-image': props.image != null,
      'p-avatar-circle': props.shape === 'circle',
      'p-avatar-lg': props.size === 'large',
      'p-avatar-xl': props.size === 'xlarge'
    }];
  },
  label: 'p-avatar-label',
  icon: 'p-avatar-icon'
};
var AvatarStyle = BaseStyle.extend({
  name: 'avatar',
  theme: theme$j,
  classes: classes$k
});

var theme$i = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-textarea {\n    font-family: inherit;\n    font-feature-settings: inherit;\n    font-size: 1rem;\n    color: ".concat(dt('textarea.color'), ";\n    background: ").concat(dt('textarea.background'), ";\n    padding: ").concat(dt('textarea.padding.y'), " ").concat(dt('textarea.padding.x'), ";\n    border: 1px solid ").concat(dt('textarea.border.color'), ";\n    transition: background ").concat(dt('textarea.transition.duration'), ", color ").concat(dt('textarea.transition.duration'), ", border-color ").concat(dt('textarea.transition.duration'), ", outline-color ").concat(dt('textarea.transition.duration'), ", box-shadow ").concat(dt('textarea.transition.duration'), ";\n    appearance: none;\n    border-radius: ").concat(dt('textarea.border.radius'), ";\n    outline-color: transparent;\n    box-shadow: ").concat(dt('textarea.shadow'), ";\n}\n\n.p-textarea:enabled:hover {\n    border-color: ").concat(dt('textarea.hover.border.color'), ";\n}\n\n.p-textarea:enabled:focus {\n    border-color: ").concat(dt('textarea.focus.border.color'), ";\n    box-shadow: ").concat(dt('textarea.focus.ring.shadow'), ";\n    outline: ").concat(dt('textarea.focus.ring.width'), " ").concat(dt('textarea.focus.ring.style'), " ").concat(dt('textarea.focus.ring.color'), ";\n    outline-offset: ").concat(dt('textarea.focus.ring.offset'), ";\n}\n\n.p-textarea.p-invalid {\n    border-color: ").concat(dt('textarea.invalid.border.color'), ";\n}\n\n.p-textarea.p-variant-filled {\n    background: ").concat(dt('textarea.filled.background'), ";\n}\n\n.p-textarea.p-variant-filled:enabled:focus {\n    background: ").concat(dt('textarea.filled.focus.background'), ";\n}\n\n.p-textarea:disabled {\n    opacity: 1;\n    background: ").concat(dt('textarea.disabled.background'), ";\n    color: ").concat(dt('textarea.disabled.color'), ";\n}\n\n.p-textarea::placeholder {\n    color: ").concat(dt('textarea.placeholder.color'), ";\n}\n\n.p-textarea-fluid {\n    width: 100%;\n}\n\n.p-textarea-resizable {\n    overflow: hidden;\n    resize: none;\n}\n");
};
var classes$j = {
  root: function root(_ref2) {
    var instance = _ref2.instance,
      props = _ref2.props;
    return ['p-textarea p-component', {
      'p-filled': instance.filled,
      'p-textarea-resizable ': props.autoResize,
      'p-invalid': props.invalid,
      'p-variant-filled': props.variant ? props.variant === 'filled' : instance.$primevue.config.inputStyle === 'filled' || instance.$primevue.config.inputVariant === 'filled',
      'p-textarea-fluid': instance.hasFluid
    }];
  }
};
var TextareaStyle = BaseStyle.extend({
  name: 'textarea',
  theme: theme$i,
  classes: classes$j
});

var theme$h = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-inputnumber {\n    display: inline-flex;\n    position: relative;\n}\n\n.p-inputnumber-button {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    flex: 0 0 auto;\n    cursor: pointer;\n    background: ".concat(dt('inputnumber.button.background'), ";\n    color: ").concat(dt('inputnumber.button.color'), ";\n    width: ").concat(dt('inputnumber.button.width'), ";\n    transition: background ").concat(dt('inputnumber.transition.duration'), ", color ").concat(dt('inputnumber.transition.duration'), ", border-color ").concat(dt('inputnumber.transition.duration'), ", outline-color ").concat(dt('inputnumber.transition.duration'), ";\n}\n\n.p-inputnumber-button:hover {\n    background: ").concat(dt('inputnumber.button.hover.background'), ";\n    color: ").concat(dt('inputnumber.button.hover.color'), ";\n}\n\n.p-inputnumber-button:active {\n    background: ").concat(dt('inputnumber.button.active.background'), ";\n    color: ").concat(dt('inputnumber.button.active.color'), ";\n}\n\n.p-inputnumber-stacked .p-inputnumber-button {\n    position: relative;\n    border: 0 none;\n}\n\n.p-inputnumber-stacked .p-inputnumber-button-group {\n    display: flex;\n    flex-direction: column;\n    position: absolute;\n    top: 1px;\n    right: 1px;\n    height: calc(100% - 2px);\n    z-index: 1;\n}\n\n.p-inputnumber-stacked .p-inputnumber-increment-button {\n    padding: 0;\n    border-top-right-radius: calc(").concat(dt('inputnumber.button.border.radius'), " - 1px);\n}\n\n.p-inputnumber-stacked .p-inputnumber-decrement-button {\n    padding: 0;\n    border-bottom-right-radius: calc(").concat(dt('inputnumber.button.border.radius'), " - 1px);\n}\n\n.p-inputnumber-stacked .p-inputnumber-button {\n    flex: 1 1 auto;\n    border: 0 none;\n}\n\n.p-inputnumber-horizontal .p-inputnumber-button {\n    border: 1px solid ").concat(dt('inputnumber.button.border.color'), ";\n}\n\n.p-inputnumber-horizontal .p-inputnumber-button:hover {\n    border-color: ").concat(dt('inputnumber.button.hover.border.color'), ";\n}\n\n.p-inputnumber-horizontal .p-inputnumber-button:active {\n    border-color: ").concat(dt('inputnumber.button.active.border.color'), ";\n}\n\n.p-inputnumber-horizontal .p-inputnumber-increment-button {\n    order: 3;\n    border-top-right-radius: ").concat(dt('inputnumber.button.border.radius'), ";\n    border-bottom-right-radius: ").concat(dt('inputnumber.button.border.radius'), ";\n    border-left: 0 none;\n}\n\n.p-inputnumber-horizontal .p-inputnumber-input {\n    order: 2;\n    border-radius: 0;\n}\n\n.p-inputnumber-horizontal .p-inputnumber-decrement-button {\n    order: 1;\n    border-top-left-radius: ").concat(dt('inputnumber.button.border.radius'), ";\n    border-bottom-left-radius: ").concat(dt('inputnumber.button.border.radius'), ";\n    border-right: 0 none;\n}\n\n.p-inputnumber-vertical {\n    flex-direction: column;\n}\n\n.p-inputnumber-vertical .p-inputnumber-button {\n    border: 1px solid ").concat(dt('inputnumber.button.border.color'), ";\n    padding: ").concat(dt('inputnumber.button.vertical.padding'), "; 0;\n}\n\n.p-inputnumber-vertical .p-inputnumber-button:hover {\n    border-color: ").concat(dt('inputnumber.button.hover.border.color'), ";\n}\n\n.p-inputnumber-vertical .p-inputnumber-button:active {\n    border-color: ").concat(dt('inputnumber.button.active.border.color'), ";\n}\n\n.p-inputnumber-vertical .p-inputnumber-increment-button {\n    order: 1;\n    border-top-left-radius: ").concat(dt('inputnumber.button.border.radius'), ";\n    border-top-right-radius: ").concat(dt('inputnumber.button.border.radius'), ";\n    width: 100%;\n    border-bottom: 0 none;\n}\n\n.p-inputnumber-vertical .p-inputnumber-input {\n    order: 2;\n    border-radius: 0;\n    text-align: center;\n}\n\n.p-inputnumber-vertical .p-inputnumber-decrement-button {\n    order: 3;\n    border-bottom-left-radius: ").concat(dt('inputnumber.button.border.radius'), ";\n    border-bottom-right-radius: ").concat(dt('inputnumber.button.border.radius'), ";\n    width: 100%;\n    border-top: 0 none;\n}\n\n.p-inputnumber-input {\n    flex: 1 1 auto;\n}\n\n.p-inputnumber-fluid {\n    width: 100%;\n}\n\n.p-inputnumber-fluid .p-inputnumber-input {\n    width: 1%;\n}\n\n.p-inputnumber-fluid.p-inputnumber-vertical .p-inputnumber-input {\n    width: 100%;\n}\n");
};
var classes$i = {
  root: function root(_ref2) {
    var instance = _ref2.instance,
      props = _ref2.props;
    return ['p-inputnumber p-component p-inputwrapper', {
      'p-inputwrapper-filled': instance.filled || props.allowEmpty === false,
      'p-inputwrapper-focus': instance.focused,
      'p-inputnumber-stacked': props.showButtons && props.buttonLayout === 'stacked',
      'p-inputnumber-horizontal': props.showButtons && props.buttonLayout === 'horizontal',
      'p-inputnumber-vertical': props.showButtons && props.buttonLayout === 'vertical',
      'p-inputnumber-fluid': instance.hasFluid
    }];
  },
  pcInput: 'p-inputnumber-input',
  buttonGroup: 'p-inputnumber-button-group',
  incrementButton: function incrementButton(_ref3) {
    var instance = _ref3.instance,
      props = _ref3.props;
    return ['p-inputnumber-button p-inputnumber-increment-button', {
      'p-disabled': props.showButtons && props.max !== null && instance.maxBoundry()
    }];
  },
  decrementButton: function decrementButton(_ref4) {
    var instance = _ref4.instance,
      props = _ref4.props;
    return ['p-inputnumber-button p-inputnumber-decrement-button', {
      'p-disabled': props.showButtons && props.min !== null && instance.minBoundry()
    }];
  }
};
var InputNumberStyle = BaseStyle.extend({
  name: 'inputnumber',
  theme: theme$h,
  classes: classes$i
});

function _typeof$1(o) { "@babel/helpers - typeof"; return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$1(o); }
function _defineProperty$1(e, r, t) { return (r = _toPropertyKey$1(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey$1(t) { var i = _toPrimitive$1(t, "string"); return "symbol" == _typeof$1(i) ? i : i + ""; }
function _toPrimitive$1(t, r) { if ("object" != _typeof$1(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof$1(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var theme$g = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-button {\n    display: inline-flex;\n    cursor: pointer;\n    user-select: none;\n    align-items: center;\n    justify-content: center;\n    overflow: hidden;\n    position: relative;\n    color: ".concat(dt('button.primary.color'), ";\n    background: ").concat(dt('button.primary.background'), ";\n    border: 1px solid ").concat(dt('button.primary.border.color'), ";\n    padding: ").concat(dt('button.padding.y'), " ").concat(dt('button.padding.x'), ";\n    font-size: 1rem;\n    font-family: inherit;\n    font-feature-settings: inherit;\n    transition: background ").concat(dt('button.transition.duration'), ", color ").concat(dt('button.transition.duration'), ", border-color ").concat(dt('button.transition.duration'), ",\n            outline-color ").concat(dt('button.transition.duration'), ", box-shadow ").concat(dt('button.transition.duration'), ";\n    border-radius: ").concat(dt('button.border.radius'), ";\n    outline-color: transparent;\n    gap: ").concat(dt('button.gap'), ";\n}\n\n.p-button:disabled {\n    cursor: default;\n}\n\n.p-button-icon-right {\n    order: 1;\n}\n\n.p-button-icon-bottom {\n    order: 2;\n}\n\n.p-button-icon-only {\n    width: ").concat(dt('button.icon.only.width'), ";\n    padding-left: 0;\n    padding-right: 0;\n    gap: 0;\n}\n\n.p-button-icon-only.p-button-rounded {\n    border-radius: 50%;\n    height: ").concat(dt('button.icon.only.width'), ";\n}\n\n.p-button-icon-only .p-button-label {\n    visibility: hidden;\n    width: 0;\n}\n\n.p-button-sm {\n    font-size: ").concat(dt('button.sm.font.size'), ";\n    padding: ").concat(dt('button.sm.padding.y'), " ").concat(dt('button.sm.padding.x'), ";\n}\n\n.p-button-sm .p-button-icon {\n    font-size: ").concat(dt('button.sm.font.size'), ";\n}\n\n.p-button-lg {\n    font-size: ").concat(dt('button.lg.font.size'), ";\n    padding: ").concat(dt('button.lg.padding.y'), " ").concat(dt('button.lg.padding.x'), ";\n}\n\n.p-button-lg .p-button-icon {\n    font-size: ").concat(dt('button.lg.font.size'), ";\n}\n\n.p-button-vertical {\n    flex-direction: column;\n}\n\n.p-button-label {\n    font-weight: ").concat(dt('button.label.font.weight'), ";\n}\n\n.p-button-fluid {\n    width: 100%;\n}\n\n.p-button-fluid.p-button-icon-only {\n    width: ").concat(dt('button.icon.only.width'), ";\n}\n\n.p-button:not(:disabled):hover {\n    background: ").concat(dt('button.primary.hover.background'), ";\n    border: 1px solid ").concat(dt('button.primary.hover.border.color'), ";\n    color: ").concat(dt('button.primary.hover.color'), ";\n}\n\n.p-button:not(:disabled):active {\n    background: ").concat(dt('button.primary.active.background'), ";\n    border: 1px solid ").concat(dt('button.primary.active.border.color'), ";\n    color: ").concat(dt('button.primary.active.color'), ";\n}\n\n.p-button:focus-visible {\n    box-shadow: ").concat(dt('button.primary.focus.ring.shadow'), ";\n    outline: ").concat(dt('button.focus.ring.width'), " ").concat(dt('button.focus.ring.style'), " ").concat(dt('button.primary.focus.ring.color'), ";\n    outline-offset: ").concat(dt('button.focus.ring.offset'), ";\n}\n\n.p-button .p-badge {\n    min-width: ").concat(dt('button.badge.size'), ";\n    height: ").concat(dt('button.badge.size'), ";\n    line-height: ").concat(dt('button.badge.size'), ";\n}\n\n.p-button-raised {\n    box-shadow: ").concat(dt('button.raised.shadow'), ";\n}\n\n.p-button-rounded {\n    border-radius: ").concat(dt('button.rounded.border.radius'), ";\n}\n\n.p-button-secondary {\n    background: ").concat(dt('button.secondary.background'), ";\n    border: 1px solid ").concat(dt('button.secondary.border.color'), ";\n    color: ").concat(dt('button.secondary.color'), ";\n}\n\n.p-button-secondary:not(:disabled):hover {\n    background: ").concat(dt('button.secondary.hover.background'), ";\n    border: 1px solid ").concat(dt('button.secondary.hover.border.color'), ";\n    color: ").concat(dt('button.secondary.hover.color'), ";\n}\n\n.p-button-secondary:not(:disabled):active {\n    background: ").concat(dt('button.secondary.active.background'), ";\n    border: 1px solid ").concat(dt('button.secondary.active.border.color'), ";\n    color: ").concat(dt('button.secondary.active.color'), ";\n}\n\n.p-button-secondary:focus-visible {\n    outline-color: ").concat(dt('button.secondary.focus.ring.color'), ";\n    box-shadow: ").concat(dt('button.secondary.focus.ring.shadow'), ";\n}\n\n.p-button-success {\n    background: ").concat(dt('button.success.background'), ";\n    border: 1px solid ").concat(dt('button.success.border.color'), ";\n    color: ").concat(dt('button.success.color'), ";\n}\n\n.p-button-success:not(:disabled):hover {\n    background: ").concat(dt('button.success.hover.background'), ";\n    border: 1px solid ").concat(dt('button.success.hover.border.color'), ";\n    color: ").concat(dt('button.success.hover.color'), ";\n}\n\n.p-button-success:not(:disabled):active {\n    background: ").concat(dt('button.success.active.background'), ";\n    border: 1px solid ").concat(dt('button.success.active.border.color'), ";\n    color: ").concat(dt('button.success.active.color'), ";\n}\n\n.p-button-success:focus-visible {\n    outline-color: ").concat(dt('button.success.focus.ring.color'), ";\n    box-shadow: ").concat(dt('button.success.focus.ring.shadow'), ";\n}\n\n.p-button-info {\n    background: ").concat(dt('button.info.background'), ";\n    border: 1px solid ").concat(dt('button.info.border.color'), ";\n    color: ").concat(dt('button.info.color'), ";\n}\n\n.p-button-info:not(:disabled):hover {\n    background: ").concat(dt('button.info.hover.background'), ";\n    border: 1px solid ").concat(dt('button.info.hover.border.color'), ";\n    color: ").concat(dt('button.info.hover.color'), ";\n}\n\n.p-button-info:not(:disabled):active {\n    background: ").concat(dt('button.info.active.background'), ";\n    border: 1px solid ").concat(dt('button.info.active.border.color'), ";\n    color: ").concat(dt('button.info.active.color'), ";\n}\n\n.p-button-info:focus-visible {\n    outline-color: ").concat(dt('button.info.focus.ring.color'), ";\n    box-shadow: ").concat(dt('button.info.focus.ring.shadow'), ";\n}\n\n.p-button-warn {\n    background: ").concat(dt('button.warn.background'), ";\n    border: 1px solid ").concat(dt('button.warn.border.color'), ";\n    color: ").concat(dt('button.warn.color'), ";\n}\n\n.p-button-warn:not(:disabled):hover {\n    background: ").concat(dt('button.warn.hover.background'), ";\n    border: 1px solid ").concat(dt('button.warn.hover.border.color'), ";\n    color: ").concat(dt('button.warn.hover.color'), ";\n}\n\n.p-button-warn:not(:disabled):active {\n    background: ").concat(dt('button.warn.active.background'), ";\n    border: 1px solid ").concat(dt('button.warn.active.border.color'), ";\n    color: ").concat(dt('button.warn.active.color'), ";\n}\n\n.p-button-warn:focus-visible {\n    outline-color: ").concat(dt('button.warn.focus.ring.color'), ";\n    box-shadow: ").concat(dt('button.warn.focus.ring.shadow'), ";\n}\n\n.p-button-help {\n    background: ").concat(dt('button.help.background'), ";\n    border: 1px solid ").concat(dt('button.help.border.color'), ";\n    color: ").concat(dt('button.help.color'), ";\n}\n\n.p-button-help:not(:disabled):hover {\n    background: ").concat(dt('button.help.hover.background'), ";\n    border: 1px solid ").concat(dt('button.help.hover.border.color'), ";\n    color: ").concat(dt('button.help.hover.color'), ";\n}\n\n.p-button-help:not(:disabled):active {\n    background: ").concat(dt('button.help.active.background'), ";\n    border: 1px solid ").concat(dt('button.help.active.border.color'), ";\n    color: ").concat(dt('button.help.active.color'), ";\n}\n\n.p-button-help:focus-visible {\n    outline-color: ").concat(dt('button.help.focus.ring.color'), ";\n    box-shadow: ").concat(dt('button.help.focus.ring.shadow'), ";\n}\n\n.p-button-danger {\n    background: ").concat(dt('button.danger.background'), ";\n    border: 1px solid ").concat(dt('button.danger.border.color'), ";\n    color: ").concat(dt('button.danger.color'), ";\n}\n\n.p-button-danger:not(:disabled):hover {\n    background: ").concat(dt('button.danger.hover.background'), ";\n    border: 1px solid ").concat(dt('button.danger.hover.border.color'), ";\n    color: ").concat(dt('button.danger.hover.color'), ";\n}\n\n.p-button-danger:not(:disabled):active {\n    background: ").concat(dt('button.danger.active.background'), ";\n    border: 1px solid ").concat(dt('button.danger.active.border.color'), ";\n    color: ").concat(dt('button.danger.active.color'), ";\n}\n\n.p-button-danger:focus-visible {\n    outline-color: ").concat(dt('button.danger.focus.ring.color'), ";\n    box-shadow: ").concat(dt('button.danger.focus.ring.shadow'), ";\n}\n\n.p-button-contrast {\n    background: ").concat(dt('button.contrast.background'), ";\n    border: 1px solid ").concat(dt('button.contrast.border.color'), ";\n    color: ").concat(dt('button.contrast.color'), ";\n}\n\n.p-button-contrast:not(:disabled):hover {\n    background: ").concat(dt('button.contrast.hover.background'), ";\n    border: 1px solid ").concat(dt('button.contrast.hover.border.color'), ";\n    color: ").concat(dt('button.contrast.hover.color'), ";\n}\n\n.p-button-contrast:not(:disabled):active {\n    background: ").concat(dt('button.contrast.active.background'), ";\n    border: 1px solid ").concat(dt('button.contrast.active.border.color'), ";\n    color: ").concat(dt('button.contrast.active.color'), ";\n}\n\n.p-button-contrast:focus-visible {\n    outline-color: ").concat(dt('button.contrast.focus.ring.color'), ";\n    box-shadow: ").concat(dt('button.contrast.focus.ring.shadow'), ";\n}\n\n.p-button-outlined {\n    background: transparent;\n    border-color: ").concat(dt('button.outlined.primary.border.color'), ";\n    color: ").concat(dt('button.outlined.primary.color'), ";\n}\n\n.p-button-outlined:not(:disabled):hover {\n    background: ").concat(dt('button.outlined.primary.hover.background'), ";\n    border-color: ").concat(dt('button.outlined.primary.border.color'), ";\n    color: ").concat(dt('button.outlined.primary.color'), ";\n}\n\n.p-button-outlined:not(:disabled):active {\n    background: ").concat(dt('button.outlined.primary.active.background'), ";\n    border-color: ").concat(dt('button.outlined.primary.border.color'), ";\n    color: ").concat(dt('button.outlined.primary.color'), ";\n}\n\n.p-button-outlined.p-button-secondary {\n    border-color: ").concat(dt('button.outlined.secondary.border.color'), ";\n    color: ").concat(dt('button.outlined.secondary.color'), ";\n}\n\n.p-button-outlined.p-button-secondary:not(:disabled):hover {\n    background: ").concat(dt('button.outlined.secondary.hover.background'), ";\n    border-color: ").concat(dt('button.outlined.secondary.border.color'), ";\n    color: ").concat(dt('button.outlined.secondary.color'), ";\n}\n\n.p-button-outlined.p-button-secondary:not(:disabled):active {\n    background: ").concat(dt('button.outlined.secondary.active.background'), ";\n    border-color: ").concat(dt('button.outlined.secondary.border.color'), ";\n    color: ").concat(dt('button.outlined.secondary.color'), ";\n}\n\n.p-button-outlined.p-button-success {\n    border-color: ").concat(dt('button.outlined.success.border.color'), ";\n    color: ").concat(dt('button.outlined.success.color'), ";\n}\n\n.p-button-outlined.p-button-success:not(:disabled):hover {\n    background: ").concat(dt('button.outlined.success.hover.background'), ";\n    border-color: ").concat(dt('button.outlined.success.border.color'), ";\n    color: ").concat(dt('button.outlined.success.color'), ";\n}\n\n.p-button-outlined.p-button-success:not(:disabled):active {\n    background: ").concat(dt('button.outlined.success.active.background'), ";\n    border-color: ").concat(dt('button.outlined.success.border.color'), ";\n    color: ").concat(dt('button.outlined.success.color'), ";\n}\n\n.p-button-outlined.p-button-info {\n    border-color: ").concat(dt('button.outlined.info.border.color'), ";\n    color: ").concat(dt('button.outlined.info.color'), ";\n}\n\n.p-button-outlined.p-button-info:not(:disabled):hover {\n    background: ").concat(dt('button.outlined.info.hover.background'), ";\n    border-color: ").concat(dt('button.outlined.info.border.color'), ";\n    color: ").concat(dt('button.outlined.info.color'), ";\n}\n\n.p-button-outlined.p-button-info:not(:disabled):active {\n    background: ").concat(dt('button.outlined.info.active.background'), ";\n    border-color: ").concat(dt('button.outlined.info.border.color'), ";\n    color: ").concat(dt('button.outlined.info.color'), ";\n}\n\n.p-button-outlined.p-button-warn {\n    border-color: ").concat(dt('button.outlined.warn.border.color'), ";\n    color: ").concat(dt('button.outlined.warn.color'), ";\n}\n\n.p-button-outlined.p-button-warn:not(:disabled):hover {\n    background: ").concat(dt('button.outlined.warn.hover.background'), ";\n    border-color: ").concat(dt('button.outlined.warn.border.color'), ";\n    color: ").concat(dt('button.outlined.warn.color'), ";\n}\n\n.p-button-outlined.p-button-warn:not(:disabled):active {\n    background: ").concat(dt('button.outlined.warn.active.background'), ";\n    border-color: ").concat(dt('button.outlined.warn.border.color'), ";\n    color: ").concat(dt('button.outlined.warn.color'), ";\n}\n\n.p-button-outlined.p-button-help {\n    border-color: ").concat(dt('button.outlined.help.border.color'), ";\n    color: ").concat(dt('button.outlined.help.color'), ";\n}\n\n.p-button-outlined.p-button-help:not(:disabled):hover {\n    background: ").concat(dt('button.outlined.help.hover.background'), ";\n    border-color: ").concat(dt('button.outlined.help.border.color'), ";\n    color: ").concat(dt('button.outlined.help.color'), ";\n}\n\n.p-button-outlined.p-button-help:not(:disabled):active {\n    background: ").concat(dt('button.outlined.help.active.background'), ";\n    border-color: ").concat(dt('button.outlined.help.border.color'), ";\n    color: ").concat(dt('button.outlined.help.color'), ";\n}\n\n.p-button-outlined.p-button-danger {\n    border-color: ").concat(dt('button.outlined.danger.border.color'), ";\n    color: ").concat(dt('button.outlined.danger.color'), ";\n}\n\n.p-button-outlined.p-button-danger:not(:disabled):hover {\n    background: ").concat(dt('button.outlined.danger.hover.background'), ";\n    border-color: ").concat(dt('button.outlined.danger.border.color'), ";\n    color: ").concat(dt('button.outlined.danger.color'), ";\n}\n\n.p-button-outlined.p-button-danger:not(:disabled):active {\n    background: ").concat(dt('button.outlined.danger.active.background'), ";\n    border-color: ").concat(dt('button.outlined.danger.border.color'), ";\n    color: ").concat(dt('button.outlined.danger.color'), ";\n}\n\n.p-button-outlined.p-button-contrast {\n    border-color: ").concat(dt('button.outlined.contrast.border.color'), ";\n    color: ").concat(dt('button.outlined.contrast.color'), ";\n}\n\n.p-button-outlined.p-button-contrast:not(:disabled):hover {\n    background: ").concat(dt('button.outlined.contrast.hover.background'), ";\n    border-color: ").concat(dt('button.outlined.contrast.border.color'), ";\n    color: ").concat(dt('button.outlined.contrast.color'), ";\n}\n\n.p-button-outlined.p-button-contrast:not(:disabled):active {\n    background: ").concat(dt('button.outlined.contrast.active.background'), ";\n    border-color: ").concat(dt('button.outlined.contrast.border.color'), ";\n    color: ").concat(dt('button.outlined.contrast.color'), ";\n}\n\n.p-button-outlined.p-button-plain {\n    border-color: ").concat(dt('button.outlined.plain.border.color'), ";\n    color: ").concat(dt('button.outlined.plain.color'), ";\n}\n\n.p-button-outlined.p-button-plain:not(:disabled):hover {\n    background: ").concat(dt('button.outlined.plain.hover.background'), ";\n    border-color: ").concat(dt('button.outlined.plain.border.color'), ";\n    color: ").concat(dt('button.outlined.plain.color'), ";\n}\n\n.p-button-outlined.p-button-plain:not(:disabled):active {\n    background: ").concat(dt('button.outlined.plain.active.background'), ";\n    border-color: ").concat(dt('button.outlined.plain.border.color'), ";\n    color: ").concat(dt('button.outlined.plain.color'), ";\n}\n\n.p-button-text {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.text.primary.color'), ";\n}\n\n.p-button-text:not(:disabled):hover {\n    background: ").concat(dt('button.text.primary.hover.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.primary.color'), ";\n}\n\n.p-button-text:not(:disabled):active {\n    background: ").concat(dt('button.text.primary.active.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.primary.color'), ";\n}\n\n.p-button-text.p-button-secondary {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.text.secondary.color'), ";\n}\n\n.p-button-text.p-button-secondary:not(:disabled):hover {\n    background: ").concat(dt('button.text.secondary.hover.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.secondary.color'), ";\n}\n\n.p-button-text.p-button-secondary:not(:disabled):active {\n    background: ").concat(dt('button.text.secondary.active.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.secondary.color'), ";\n}\n\n.p-button-text.p-button-success {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.text.success.color'), ";\n}\n\n.p-button-text.p-button-success:not(:disabled):hover {\n    background: ").concat(dt('button.text.success.hover.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.success.color'), ";\n}\n\n.p-button-text.p-button-success:not(:disabled):active {\n    background: ").concat(dt('button.text.success.active.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.success.color'), ";\n}\n\n.p-button-text.p-button-info {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.text.info.color'), ";\n}\n\n.p-button-text.p-button-info:not(:disabled):hover {\n    background: ").concat(dt('button.text.info.hover.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.info.color'), ";\n}\n\n.p-button-text.p-button-info:not(:disabled):active {\n    background: ").concat(dt('button.text.info.active.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.info.color'), ";\n}\n\n.p-button-text.p-button-warn {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.text.warn.color'), ";\n}\n\n.p-button-text.p-button-warn:not(:disabled):hover {\n    background: ").concat(dt('button.text.warn.hover.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.warn.color'), ";\n}\n\n.p-button-text.p-button-warn:not(:disabled):active {\n    background: ").concat(dt('button.text.warn.active.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.warn.color'), ";\n}\n\n.p-button-text.p-button-help {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.text.help.color'), ";\n}\n\n.p-button-text.p-button-help:not(:disabled):hover {\n    background: ").concat(dt('button.text.help.hover.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.help.color'), ";\n}\n\n.p-button-text.p-button-help:not(:disabled):active {\n    background: ").concat(dt('button.text.help.active.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.help.color'), ";\n}\n\n.p-button-text.p-button-danger {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.text.danger.color'), ";\n}\n\n.p-button-text.p-button-danger:not(:disabled):hover {\n    background: ").concat(dt('button.text.danger.hover.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.danger.color'), ";\n}\n\n.p-button-text.p-button-danger:not(:disabled):active {\n    background: ").concat(dt('button.text.danger.active.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.danger.color'), ";\n}\n\n.p-button-text.p-button-plain {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.text.plain.color'), ";\n}\n\n.p-button-text.p-button-plain:not(:disabled):hover {\n    background: ").concat(dt('button.text.plain.hover.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.plain.color'), ";\n}\n\n.p-button-text.p-button-plain:not(:disabled):active {\n    background: ").concat(dt('button.text.plain.active.background'), ";\n    border-color: transparent;\n    color: ").concat(dt('button.text.plain.color'), ";\n}\n\n.p-button-link {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.link.color'), ";\n}\n\n.p-button-link:not(:disabled):hover {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.link.hover.color'), ";\n}\n\n.p-button-link:not(:disabled):hover .p-button-label {\n    text-decoration: underline;\n}\n\n.p-button-link:not(:disabled):active {\n    background: transparent;\n    border-color: transparent;\n    color: ").concat(dt('button.link.active.color'), ";\n}\n");
};
var classes$h = {
  root: function root(_ref2) {
    var instance = _ref2.instance,
      props = _ref2.props;
    return ['p-button p-component', _defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1(_defineProperty$1({
      'p-button-icon-only': instance.hasIcon && !props.label && !props.badge,
      'p-button-vertical': (props.iconPos === 'top' || props.iconPos === 'bottom') && props.label,
      'p-button-loading': props.loading,
      'p-button-link': props.link
    }, "p-button-".concat(props.severity), props.severity), 'p-button-raised', props.raised), 'p-button-rounded', props.rounded), 'p-button-text', props.text), 'p-button-outlined', props.outlined), 'p-button-sm', props.size === 'small'), 'p-button-lg', props.size === 'large'), 'p-button-plain', props.plain), 'p-button-fluid', instance.hasFluid)];
  },
  loadingIcon: 'p-button-loading-icon',
  icon: function icon(_ref4) {
    var props = _ref4.props;
    return ['p-button-icon', _defineProperty$1({}, "p-button-icon-".concat(props.iconPos), props.label)];
  },
  label: 'p-button-label'
};
var ButtonStyle = BaseStyle.extend({
  name: 'button',
  theme: theme$g,
  classes: classes$h
});

var theme$f = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-drawer {\n    display: flex;\n    flex-direction: column;\n    pointer-events: auto;\n    transform: translate3d(0px, 0px, 0px);\n    position: relative;\n    transition: transform 0.3s;\n    background: ".concat(dt('drawer.background'), ";\n    color: ").concat(dt('drawer.color'), ";\n    border: 1px solid ").concat(dt('drawer.border.color'), ";\n    box-shadow: ").concat(dt('drawer.shadow'), ";\n}\n\n.p-drawer-content {\n    overflow-y: auto;\n    flex-grow: 1;\n    padding: ").concat(dt('drawer.content.padding'), ";\n}\n\n.p-drawer-header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    flex-shrink: 0;\n    padding: ").concat(dt('drawer.header.padding'), ";\n}\n\n.p-drawer-footer {\n    padding: ").concat(dt('drawer.header.padding'), ";\n}\n\n.p-drawer-title {\n    font-weight: ").concat(dt('drawer.title.font.weight'), ";\n    font-size: ").concat(dt('drawer.title.font.size'), ";\n}\n\n.p-drawer-full .p-drawer {\n    transition: none;\n    transform: none;\n    width: 100vw !important;\n    height: 100vh !important;\n    max-height: 100%;\n    top: 0px !important;\n    left: 0px !important;\n    border-width: 1px;\n}\n\n.p-drawer-left .p-drawer-enter-from,\n.p-drawer-left .p-drawer-leave-to {\n    transform: translateX(-100%);\n}\n\n.p-drawer-right .p-drawer-enter-from,\n.p-drawer-right .p-drawer-leave-to {\n    transform: translateX(100%);\n}\n\n.p-drawer-top .p-drawer-enter-from,\n.p-drawer-top .p-drawer-leave-to {\n    transform: translateY(-100%);\n}\n\n.p-drawer-bottom .p-drawer-enter-from,\n.p-drawer-bottom .p-drawer-leave-to {\n    transform: translateY(100%);\n}\n\n.p-drawer-full .p-drawer-enter-from,\n.p-drawer-full .p-drawer-leave-to {\n    opacity: 0;\n}\n\n.p-drawer-full .p-drawer-enter-active,\n.p-drawer-full .p-drawer-leave-active {\n    transition: opacity 400ms cubic-bezier(0.25, 0.8, 0.25, 1);\n}\n\n.p-drawer-left .p-drawer {\n    width: 20rem;\n    height: 100%;\n    border-right-width: 1px;\n}\n\n.p-drawer-right .p-drawer {\n    width: 20rem;\n    height: 100%;\n    border-left-width: 1px;\n}\n\n.p-drawer-top .p-drawer {\n    height: 10rem;\n    width: 100%;\n    border-bottom-width: 1px;\n}\n\n.p-drawer-bottom .p-drawer {\n    height: 10rem;\n    width: 100%;\n    border-top-width: 1px;\n}\n\n.p-drawer-left .p-drawer-content,\n.p-drawer-right .p-drawer-content,\n.p-drawer-top .p-drawer-content,\n.p-drawer-bottom .p-drawer-content {\n    width: 100%;\n    height: 100%;\n}\n\n.p-drawer-open {\n    display: flex;\n}\n");
};
var inlineStyles$6 = {
  mask: function mask(_ref2) {
    var position = _ref2.position;
    return {
      position: 'fixed',
      height: '100%',
      width: '100%',
      left: 0,
      top: 0,
      display: 'flex',
      justifyContent: position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center',
      alignItems: position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center'
    };
  }
};
var classes$g = {
  mask: function mask(_ref3) {
    var instance = _ref3.instance,
      props = _ref3.props;
    var positions = ['left', 'right', 'top', 'bottom'];
    var pos = positions.find(function (item) {
      return item === props.position;
    });
    return ['p-drawer-mask', {
      'p-overlay-mask p-overlay-mask-enter': props.modal,
      'p-drawer-open': instance.containerVisible,
      'p-drawer-full': instance.fullScreen
    }, pos ? "p-drawer-".concat(pos) : ''];
  },
  root: function root(_ref4) {
    var instance = _ref4.instance;
    return ['p-drawer p-component', {
      'p-drawer-full': instance.fullScreen
    }];
  },
  header: 'p-drawer-header',
  title: 'p-drawer-title',
  pcCloseButton: 'p-drawer-close-button',
  content: 'p-drawer-content',
  footer: 'p-drawer-footer'
};
var DrawerStyle = BaseStyle.extend({
  name: 'drawer',
  theme: theme$f,
  classes: classes$g,
  inlineStyles: inlineStyles$6
});

var theme$e = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-toolbar {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    flex-wrap: wrap;\n    padding: ".concat(dt('toolbar.padding'), ";\n    background: ").concat(dt('toolbar.background'), ";\n    border: 1px solid ").concat(dt('toolbar.border.color'), ";\n    color: ").concat(dt('toolbar.color'), ";\n    border-radius: ").concat(dt('toolbar.border.radius'), ";\n    gap: ").concat(dt('toolbar.gap'), ";\n}\n\n.p-toolbar-start,\n.p-toolbar-center,\n.p-toolbar-end {\n    display: flex;\n    align-items: center;\n}\n");
};
var classes$f = {
  root: 'p-toolbar p-component',
  start: 'p-toolbar-start',
  center: 'p-toolbar-center',
  end: 'p-toolbar-end'
};
var ToolbarStyle = BaseStyle.extend({
  name: 'toolbar',
  theme: theme$e,
  classes: classes$f
});

var theme$d = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-divider-horizontal {\n    display: flex;\n    width: 100%;\n    position: relative;\n    align-items: center;\n    margin: ".concat(dt('divider.horizontal.margin'), ";\n    padding: ").concat(dt('divider.horizontal.padding'), ";\n}\n\n.p-divider-horizontal:before {\n    position: absolute;\n    display: block;\n    top: 50%;\n    left: 0;\n    width: 100%;\n    content: \"\";\n    border-top: 1px solid ").concat(dt('divider.border.color'), ";\n}\n\n.p-divider-horizontal .p-divider-content {\n    padding: ").concat(dt('divider.horizontal.content.padding'), ";\n}\n\n.p-divider-vertical {\n    min-height: 100%;\n    margin: 0 1rem;\n    display: flex;\n    position: relative;\n    justify-content: center;\n    margin: ").concat(dt('divider.vertical.margin'), ";\n    padding: ").concat(dt('divider.vertical.padding'), ";\n}\n\n.p-divider-vertical:before {\n    position: absolute;\n    display: block;\n    top: 0;\n    left: 50%;\n    height: 100%;\n    content: \"\";\n    border-left: 1px solid ").concat(dt('divider.border.color'), ";\n}\n\n.p-divider.p-divider-vertical .p-divider-content {\n    padding: ").concat(dt('divider.vertical.content.padding'), ";\n}\n\n.p-divider-content {\n    z-index: 1;\n    background: ").concat(dt('divider.content.background'), ";\n    color: ").concat(dt('divider.content.color'), ";\n}\n\n.p-divider-solid.p-divider-horizontal:before {\n    border-top-style: solid;\n}\n\n.p-divider-solid.p-divider-vertical:before {\n    border-left-style: solid;\n}\n\n.p-divider-dashed.p-divider-horizontal:before {\n    border-top-style: dashed;\n}\n\n.p-divider-dashed.p-divider-vertical:before {\n    border-left-style: dashed;\n}\n\n.p-divider-dotted.p-divider-horizontal:before {\n    border-top-style: dotted;\n}\n\n.p-divider-dotted.p-divider-vertical:before {\n    border-left-style: dotted;\n}\n");
};

/* Position */
var inlineStyles$5 = {
  root: function root(_ref2) {
    var props = _ref2.props;
    return {
      justifyContent: props.layout === 'horizontal' ? props.align === 'center' || props.align === null ? 'center' : props.align === 'left' ? 'flex-start' : props.align === 'right' ? 'flex-end' : null : null,
      alignItems: props.layout === 'vertical' ? props.align === 'center' || props.align === null ? 'center' : props.align === 'top' ? 'flex-start' : props.align === 'bottom' ? 'flex-end' : null : null
    };
  }
};
var classes$e = {
  root: function root(_ref3) {
    var props = _ref3.props;
    return ['p-divider p-component', 'p-divider-' + props.layout, 'p-divider-' + props.type, {
      'p-divider-left': props.layout === 'horizontal' && (!props.align || props.align === 'left')
    }, {
      'p-divider-center': props.layout === 'horizontal' && props.align === 'center'
    }, {
      'p-divider-right': props.layout === 'horizontal' && props.align === 'right'
    }, {
      'p-divider-top': props.layout === 'vertical' && props.align === 'top'
    }, {
      'p-divider-center': props.layout === 'vertical' && (!props.align || props.align === 'center')
    }, {
      'p-divider-bottom': props.layout === 'vertical' && props.align === 'bottom'
    }];
  },
  content: 'p-divider-content'
};
var DividerStyle = BaseStyle.extend({
  name: 'divider',
  theme: theme$d,
  classes: classes$e,
  inlineStyles: inlineStyles$5
});

var theme$c = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-autocomplete {\n    display: inline-flex;\n}\n\n.p-autocomplete-loader {\n    position: absolute;\n    top: 50%;\n    margin-top: -0.5rem;\n    right: ".concat(dt('autocomplete.padding.x'), ";\n}\n\n.p-autocomplete:has(.p-autocomplete-dropdown) .p-autocomplete-loader {\n    right: calc(").concat(dt('autocomplete.dropdown.width'), " + ").concat(dt('autocomplete.padding.x'), ");\n}\n\n.p-autocomplete:has(.p-autocomplete-dropdown) .p-autocomplete-input {\n    flex: 1 1 auto;\n    width: 1%;\n}\n\n.p-autocomplete:has(.p-autocomplete-dropdown) .p-autocomplete-input,\n.p-autocomplete:has(.p-autocomplete-dropdown) .p-autocomplete-input-multiple {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0;\n}\n\n.p-autocomplete-dropdown {\n    cursor: pointer;\n    display: inline-flex;\n    cursor: pointer;\n    user-select: none;\n    align-items: center;\n    justify-content: center;\n    overflow: hidden;\n    position: relative;\n    width: ").concat(dt('autocomplete.dropdown.width'), ";\n    border-top-right-radius: ").concat(dt('autocomplete.dropdown.border.radius'), ";\n    border-bottom-right-radius: ").concat(dt('autocomplete.dropdown.border.radius'), ";\n    background: ").concat(dt('autocomplete.dropdown.background'), ";\n    border: 1px solid ").concat(dt('autocomplete.dropdown.border.color'), ";\n    border-left: 0 none;\n    color: ").concat(dt('autocomplete.dropdown.color'), ";\n    transition: background ").concat(dt('autocomplete.transition.duration'), ", color ").concat(dt('autocomplete.transition.duration'), ", border-color ").concat(dt('autocomplete.transition.duration'), ", outline-color ").concat(dt('autocomplete.transition.duration'), ", box-shadow ").concat(dt('autocomplete.transition.duration'), ";\n    outline-color: transparent;\n}\n\n.p-autocomplete-dropdown:not(:disabled):hover {\n    background: ").concat(dt('autocomplete.dropdown.hover.background'), ";\n    border-color: ").concat(dt('autocomplete.dropdown.hover.border.color'), ";\n    color: ").concat(dt('autocomplete.dropdown.hover.color'), ";\n}\n\n.p-autocomplete-dropdown:not(:disabled):active {\n    background: ").concat(dt('autocomplete.dropdown.active.background'), ";\n    border-color: ").concat(dt('autocomplete.dropdown.active.border.color'), ";\n    color: ").concat(dt('autocomplete.dropdown.active.color'), ";\n}\n\n.p-autocomplete-dropdown:focus-visible {\n    box-shadow: ").concat(dt('autocomplete.dropdown.focus.ring.shadow'), ";\n    outline: ").concat(dt('autocomplete.dropdown.focus.ring.width'), " ").concat(dt('autocomplete.dropdown.focus.ring.style'), " ").concat(dt('autocomplete.dropdown.focus.ring.color'), ";\n    outline-offset: ").concat(dt('autocomplete.dropdown.focus.ring.offset'), ";\n}\n\n.p-autocomplete .p-autocomplete-overlay {\n    min-width: 100%;\n}\n\n.p-autocomplete-overlay {\n    position: absolute;\n    overflow: auto;\n    top: 0;\n    left: 0;\n    background: ").concat(dt('autocomplete.overlay.background'), ";\n    color: ").concat(dt('autocomplete.overlay.color'), ";\n    border: 1px solid ").concat(dt('autocomplete.overlay.border.color'), ";\n    border-radius: ").concat(dt('autocomplete.overlay.border.radius'), ";\n    box-shadow: ").concat(dt('autocomplete.overlay.shadow'), ";\n}\n\n.p-autocomplete-list {\n    margin: 0;\n    padding: 0;\n    list-style-type: none;\n    display: flex;\n    flex-direction: column;\n    gap: ").concat(dt('autocomplete.list.gap'), ";\n    padding: ").concat(dt('autocomplete.list.padding'), ";\n}\n\n.p-autocomplete-option {\n    cursor: pointer;\n    white-space: nowrap;\n    position: relative;\n    overflow: hidden;\n    display: flex;\n    align-items: center;\n    padding: ").concat(dt('autocomplete.option.padding'), ";\n    border: 0 none;\n    color: ").concat(dt('autocomplete.option.color'), ";\n    background: transparent;\n    transition: background ").concat(dt('autocomplete.transition.duration'), ", color ").concat(dt('autocomplete.transition.duration'), ", border-color ").concat(dt('autocomplete.transition.duration'), ";\n    border-radius: ").concat(dt('autocomplete.option.border.radius'), ";\n}\n\n.p-autocomplete-option:not(.p-autocomplete-option-selected):not(.p-disabled).p-focus {\n    background: ").concat(dt('autocomplete.option.focus.background'), ";\n    color: ").concat(dt('autocomplete.option.focus.color'), ";\n}\n\n.p-autocomplete-option-selected {\n    background: ").concat(dt('autocomplete.option.selected.background'), ";\n    color: ").concat(dt('autocomplete.option.selected.color'), ";\n}\n\n.p-autocomplete-option-selected.p-focus {\n    background: ").concat(dt('autocomplete.option.selected.focus.background'), ";\n    color: ").concat(dt('autocomplete.option.selected.focus.color'), ";\n}\n\n.p-autocomplete-option-group {\n    margin: 0;\n    padding: ").concat(dt('autocomplete.option.group.padding'), ";\n    color: ").concat(dt('autocomplete.option.group.color'), ";\n    background: ").concat(dt('autocomplete.option.group.background'), ";\n    font-weight: ").concat(dt('autocomplete.option.group.font.weight'), ";\n}\n\n.p-autocomplete-input-multiple {\n    margin: 0;\n    list-style-type: none;\n    cursor: text;\n    overflow: hidden;\n    display: flex;\n    align-items: center;\n    flex-wrap: wrap;\n    padding: calc(").concat(dt('autocomplete.padding.y'), " / 2) ").concat(dt('autocomplete.padding.x'), ";\n    gap: calc(").concat(dt('autocomplete.padding.y'), " / 2);\n    color: ").concat(dt('autocomplete.color'), ";\n    background: ").concat(dt('autocomplete.background'), ";\n    border: 1px solid ").concat(dt('autocomplete.border.color'), ";\n    border-radius: ").concat(dt('autocomplete.border.radius'), ";\n    width: 100%;\n    transition: background ").concat(dt('autocomplete.transition.duration'), ", color ").concat(dt('autocomplete.transition.duration'), ", border-color ").concat(dt('autocomplete.transition.duration'), ", outline-color ").concat(dt('autocomplete.transition.duration'), ", box-shadow ").concat(dt('autocomplete.transition.duration'), ";\n    outline-color: transparent;\n    box-shadow: ").concat(dt('autocomplete.shadow'), ";\n}\n\n.p-autocomplete:not(.p-disabled):hover .p-autocomplete-input-multiple {\n    border-color: ").concat(dt('autocomplete.hover.border.color'), ";\n}\n\n.p-autocomplete:not(.p-disabled).p-focus .p-autocomplete-input-multiple {\n    border-color: ").concat(dt('autocomplete.focus.border.color'), ";\n    box-shadow: ").concat(dt('autocomplete.focus.ring.shadow'), ";\n    outline: ").concat(dt('autocomplete.focus.ring.width'), " ").concat(dt('autocomplete.focus.ring.style'), " ").concat(dt('autocomplete.focus.ring.color'), ";\n    outline-offset: ").concat(dt('autocomplete.focus.ring.offset'), ";\n}\n\n.p-autocomplete.p-invalid .p-autocomplete-input-multiple {\n    border-color: ").concat(dt('autocomplete.invalid.border.color'), ";\n}\n\n.p-variant-filled.p-autocomplete-input-multiple {\n    background: ").concat(dt('autocomplete.filled.background'), ";\n}\n\n.p-autocomplete:not(.p-disabled).p-focus .p-variant-filled.p-autocomplete-input-multiple  {\n    background: ").concat(dt('autocomplete.filled.focus.background'), ";\n}\n\n.p-autocomplete.p-disabled .p-autocomplete-input-multiple {\n    opacity: 1;\n    background: ").concat(dt('autocomplete.disabled.background'), ";\n    color: ").concat(dt('autocomplete.disabled.color'), ";\n}\n\n.p-autocomplete-chip.p-chip {\n    padding-top: calc(").concat(dt('autocomplete.padding.y'), " / 2);\n    padding-bottom: calc(").concat(dt('autocomplete.padding.y'), " / 2);\n    border-radius: ").concat(dt('autocomplete.chip.border.radius'), ";\n}\n\n.p-autocomplete-input-multiple:has(.p-autocomplete-chip) {\n    padding-left: calc(").concat(dt('autocomplete.padding.y'), " / 2);\n    padding-right: calc(").concat(dt('autocomplete.padding.y'), " / 2);\n}\n\n.p-autocomplete-chip-item.p-focus .p-autocomplete-chip {\n    background: ").concat(dt('inputchips.chip.focus.background'), ";\n    color: ").concat(dt('inputchips.chip.focus.color'), ";\n}\n\n.p-autocomplete-input-chip {\n    flex: 1 1 auto;\n    display: inline-flex;\n    padding-top: calc(").concat(dt('autocomplete.padding.y'), " / 2);\n    padding-bottom: calc(").concat(dt('autocomplete.padding.y'), " / 2);\n}\n\n.p-autocomplete-input-chip input {\n    border: 0 none;\n    outline: 0 none;\n    background: transparent;\n    margin: 0;\n    padding: 0;\n    box-shadow: none;\n    border-radius: 0;\n    width: 100%;\n    font-family: inherit;\n    font-feature-settings: inherit;\n    font-size: 1rem;\n    color: inherit;\n}\n\n.p-autocomplete-input-chip input::placeholder {\n    color: ").concat(dt('autocomplete.placeholder.color'), ";\n}\n\n.p-autocomplete-empty-message {\n    padding: ").concat(dt('autocomplete.empty.message.padding'), ";\n}\n\n.p-autocomplete-fluid {\n    display: flex;\n}\n\n.p-autocomplete-fluid:has(.p-autocomplete-dropdown) .p-autocomplete-input {\n    width: 1%;\n}\n");
};
var inlineStyles$4 = {
  root: {
    position: 'relative'
  }
};
var classes$d = {
  root: function root(_ref2) {
    var instance = _ref2.instance,
      props = _ref2.props;
    return ['p-autocomplete p-component p-inputwrapper', {
      'p-disabled': props.disabled,
      'p-invalid': props.invalid,
      'p-focus': instance.focused,
      'p-inputwrapper-filled': props.modelValue || isNotEmpty(instance.inputValue),
      'p-inputwrapper-focus': instance.focused,
      'p-autocomplete-open': instance.overlayVisible,
      'p-autocomplete-fluid': instance.hasFluid
    }];
  },
  pcInput: 'p-autocomplete-input',
  inputMultiple: function inputMultiple(_ref3) {
    var props = _ref3.props,
      instance = _ref3.instance;
    return ['p-autocomplete-input-multiple', {
      'p-variant-filled': props.variant ? props.variant === 'filled' : instance.$primevue.config.inputStyle === 'filled' || instance.$primevue.config.inputVariant === 'filled'
    }];
  },
  chipItem: function chipItem(_ref4) {
    var instance = _ref4.instance,
      i = _ref4.i;
    return ['p-autocomplete-chip-item', {
      'p-focus': instance.focusedMultipleOptionIndex === i
    }];
  },
  pcChip: 'p-autocomplete-chip',
  chipIcon: 'p-autocomplete-chip-icon',
  inputChip: 'p-autocomplete-input-chip',
  loader: 'p-autocomplete-loader',
  dropdown: 'p-autocomplete-dropdown',
  overlay: 'p-autocomplete-overlay p-component',
  list: 'p-autocomplete-list',
  optionGroup: 'p-autocomplete-option-group',
  option: function option(_ref5) {
    var instance = _ref5.instance,
      _option = _ref5.option,
      i = _ref5.i,
      getItemOptions = _ref5.getItemOptions;
    return ['p-autocomplete-option', {
      'p-autocomplete-option-selected': instance.isSelected(_option),
      'p-focus': instance.focusedOptionIndex === instance.getOptionIndex(i, getItemOptions),
      'p-disabled': instance.isOptionDisabled(_option)
    }];
  },
  emptyMessage: 'p-autocomplete-empty-message'
};
var AutoCompleteStyle = BaseStyle.extend({
  name: 'autocomplete',
  theme: theme$c,
  classes: classes$d,
  inlineStyles: inlineStyles$4
});

var theme$b = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-progressbar {\n    position: relative;\n    overflow: hidden;\n    height: ".concat(dt('progressbar.height'), ";\n    background: ").concat(dt('progressbar.background'), ";\n    border-radius: ").concat(dt('progressbar.border.radius'), ";\n}\n\n.p-progressbar-value {\n    margin: 0;\n    background: ").concat(dt('progressbar.value.background'), ";\n}\n\n.p-progressbar-label {\n    color: ").concat(dt('progressbar.label.color'), ";\n    font-size: ").concat(dt('progressbar.label.font.size'), ";\n    font-weight: ").concat(dt('progressbar.label.font.weight'), ";\n}\n\n.p-progressbar-determinate .p-progressbar-value {\n    height: 100%;\n    width: 0%;\n    position: absolute;\n    display: none;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    overflow: hidden;\n    transition: width 1s ease-in-out;\n}\n\n.p-progressbar-determinate .p-progressbar-label {\n    display: inline-flex;\n}\n\n.p-progressbar-indeterminate .p-progressbar-value::before {\n    content: \"\";\n    position: absolute;\n    background: inherit;\n    top: 0;\n    left: 0;\n    bottom: 0;\n    will-change: left, right;\n    animation: p-progressbar-indeterminate-anim 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;\n}\n\n.p-progressbar-indeterminate .p-progressbar-value::after {\n    content: \"\";\n    position: absolute;\n    background: inherit;\n    top: 0;\n    left: 0;\n    bottom: 0;\n    will-change: left, right;\n    animation: p-progressbar-indeterminate-anim-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;\n    animation-delay: 1.15s;\n}\n\n@-webkit-keyframes p-progressbar-indeterminate-anim {\n    0% {\n        left: -35%;\n        right: 100%;\n    }\n    60% {\n        left: 100%;\n        right: -90%;\n    }\n    100% {\n        left: 100%;\n        right: -90%;\n    }\n}\n@keyframes p-progressbar-indeterminate-anim {\n    0% {\n        left: -35%;\n        right: 100%;\n    }\n    60% {\n        left: 100%;\n        right: -90%;\n    }\n    100% {\n        left: 100%;\n        right: -90%;\n    }\n}\n@-webkit-keyframes p-progressbar-indeterminate-anim-short {\n    0% {\n        left: -200%;\n        right: 100%;\n    }\n    60% {\n        left: 107%;\n        right: -8%;\n    }\n    100% {\n        left: 107%;\n        right: -8%;\n    }\n}\n@keyframes p-progressbar-indeterminate-anim-short {\n    0% {\n        left: -200%;\n        right: 100%;\n    }\n    60% {\n        left: 107%;\n        right: -8%;\n    }\n    100% {\n        left: 107%;\n        right: -8%;\n    }\n}\n");
};
var classes$c = {
  root: function root(_ref2) {
    var instance = _ref2.instance;
    return ['p-progressbar p-component', {
      'p-progressbar-determinate': instance.determinate,
      'p-progressbar-indeterminate': instance.indeterminate
    }];
  },
  value: 'p-progressbar-value',
  label: 'p-progressbar-label'
};
var ProgressBarStyle = BaseStyle.extend({
  name: 'progressbar',
  theme: theme$b,
  classes: classes$c
});

var theme$a = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-tag {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    background: ".concat(dt('tag.primary.background'), ";\n    color: ").concat(dt('tag.primary.color'), ";\n    font-size: ").concat(dt('tag.font.size'), ";\n    font-weight: ").concat(dt('tag.font.weight'), ";\n    padding: ").concat(dt('tag.padding'), ";\n    border-radius: ").concat(dt('tag.border.radius'), ";\n    gap: ").concat(dt('tag.gap'), ";\n}\n\n.p-tag-icon {\n    font-size: ").concat(dt('tag.icon.size'), ";\n    width: ").concat(dt('tag.icon.size'), ";\n    height:").concat(dt('tag.icon.size'), ";\n}\n\n.p-tag-rounded {\n    border-radius: ").concat(dt('tag.rounded.border.radius'), ";\n}\n\n.p-tag-success {\n    background: ").concat(dt('tag.success.background'), ";\n    color: ").concat(dt('tag.success.color'), ";\n}\n\n.p-tag-info {\n    background: ").concat(dt('tag.info.background'), ";\n    color: ").concat(dt('tag.info.color'), ";\n}\n\n.p-tag-warn {\n    background: ").concat(dt('tag.warn.background'), ";\n    color: ").concat(dt('tag.warn.color'), ";\n}\n\n.p-tag-danger {\n    background: ").concat(dt('tag.danger.background'), ";\n    color: ").concat(dt('tag.danger.color'), ";\n}\n\n.p-tag-secondary {\n    background: ").concat(dt('tag.secondary.background'), ";\n    color: ").concat(dt('tag.secondary.color'), ";\n}\n\n.p-tag-contrast {\n    background: ").concat(dt('tag.contrast.background'), ";\n    color: ").concat(dt('tag.contrast.color'), ";\n}\n");
};
var classes$b = {
  root: function root(_ref2) {
    var props = _ref2.props;
    return ['p-tag p-component', {
      'p-tag-info': props.severity === 'info',
      'p-tag-success': props.severity === 'success',
      'p-tag-warn': props.severity === 'warn',
      'p-tag-danger': props.severity === 'danger',
      'p-tag-secondary': props.severity === 'secondary',
      'p-tag-contrast': props.severity === 'contrast',
      'p-tag-rounded': props.rounded
    }];
  },
  icon: 'p-tag-icon',
  label: 'p-tag-label'
};
var TagStyle = BaseStyle.extend({
  name: 'tag',
  theme: theme$a,
  classes: classes$b
});

var classes$a = {
  root: 'p-inputicon'
};
var InputIconStyle = BaseStyle.extend({
  name: 'inputicon',
  classes: classes$a
});

var theme$9 = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-inputtext {\n    font-family: inherit;\n    font-feature-settings: inherit;\n    font-size: 1rem;\n    color: ".concat(dt('inputtext.color'), ";\n    background: ").concat(dt('inputtext.background'), ";\n    padding: ").concat(dt('inputtext.padding.y'), " ").concat(dt('inputtext.padding.x'), ";\n    border: 1px solid ").concat(dt('inputtext.border.color'), ";\n    transition: background ").concat(dt('inputtext.transition.duration'), ", color ").concat(dt('inputtext.transition.duration'), ", border-color ").concat(dt('inputtext.transition.duration'), ", outline-color ").concat(dt('inputtext.transition.duration'), ", box-shadow ").concat(dt('inputtext.transition.duration'), ";\n    appearance: none;\n    border-radius: ").concat(dt('inputtext.border.radius'), ";\n    outline-color: transparent;\n    box-shadow: ").concat(dt('inputtext.shadow'), ";\n}\n\n.p-inputtext:enabled:hover {\n    border-color: ").concat(dt('inputtext.hover.border.color'), ";\n}\n\n.p-inputtext:enabled:focus {\n    border-color: ").concat(dt('inputtext.focus.border.color'), ";\n    box-shadow: ").concat(dt('inputtext.focus.ring.shadow'), ";\n    outline: ").concat(dt('inputtext.focus.ring.width'), " ").concat(dt('inputtext.focus.ring.style'), " ").concat(dt('inputtext.focus.ring.color'), ";\n    outline-offset: ").concat(dt('inputtext.focus.ring.offset'), ";\n}\n\n.p-inputtext.p-invalid {\n    border-color: ").concat(dt('inputtext.invalid.border.color'), ";\n}\n\n.p-inputtext.p-variant-filled {\n    background: ").concat(dt('inputtext.filled.background'), ";\n}\n\n.p-inputtext.p-variant-filled:enabled:focus {\n    background: ").concat(dt('inputtext.filled.focus.background'), ";\n}\n\n.p-inputtext:disabled {\n    opacity: 1;\n    background: ").concat(dt('inputtext.disabled.background'), ";\n    color: ").concat(dt('inputtext.disabled.color'), ";\n}\n\n.p-inputtext::placeholder {\n    color: ").concat(dt('inputtext.placeholder.color'), ";\n}\n\n.p-inputtext-sm {\n    font-size: ").concat(dt('inputtext.sm.font.size'), ";\n    padding: ").concat(dt('inputtext.sm.padding.y'), " ").concat(dt('inputtext.sm.padding.x'), ";\n}\n\n.p-inputtext-lg {\n    font-size: ").concat(dt('inputtext.lg.font.size'), ";\n    padding: ").concat(dt('inputtext.lg.padding.y'), " ").concat(dt('inputtext.lg.padding.x'), ";\n}\n\n.p-inputtext-fluid {\n    width: 100%;\n}\n");
};
var classes$9 = {
  root: function root(_ref2) {
    var instance = _ref2.instance,
      props = _ref2.props;
    return ['p-inputtext p-component', {
      'p-filled': instance.filled,
      'p-inputtext-sm': props.size === 'small',
      'p-inputtext-lg': props.size === 'large',
      'p-invalid': props.invalid,
      'p-variant-filled': props.variant ? props.variant === 'filled' : instance.$primevue.config.inputStyle === 'filled' || instance.$primevue.config.inputVariant === 'filled',
      'p-inputtext-fluid': instance.hasFluid
    }];
  }
};
var InputTextStyle = BaseStyle.extend({
  name: 'inputtext',
  theme: theme$9,
  classes: classes$9
});

var theme$8 = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-iconfield {\n    position: relative;\n}\n\n.p-inputicon {\n    position: absolute;\n    top: 50%;\n    margin-top: calc(-1 * (".concat(dt('icon.size'), " / 2));\n    color: ").concat(dt('iconfield.icon.color'), ";\n    line-height: 1;\n}\n\n.p-iconfield .p-inputicon:first-child {\n    left: ").concat(dt('form.field.padding.x'), ";\n}\n\n.p-iconfield .p-inputicon:last-child {\n    right: ").concat(dt('form.field.padding.x'), ";\n}\n\n.p-iconfield .p-inputtext:not(:first-child) {\n    padding-left: calc((").concat(dt('form.field.padding.x'), " * 2) + ").concat(dt('icon.size'), ");\n}\n\n.p-iconfield .p-inputtext:not(:last-child) {\n    padding-right: calc((").concat(dt('form.field.padding.x'), " * 2) + ").concat(dt('icon.size'), ");\n}\n");
};
var classes$8 = {
  root: 'p-iconfield'
};
var IconFieldStyle = BaseStyle.extend({
  name: 'iconfield',
  theme: theme$8,
  classes: classes$8
});

var ColumnStyle = BaseStyle.extend({
  name: 'column'
});

var theme$7 = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-datatable {\n    position: relative;\n}\n\n.p-datatable-table {\n    border-spacing: 0;\n    width: 100%;\n}\n\n.p-datatable-scrollable > .p-datatable-table-container {\n    position: relative;\n}\n\n.p-datatable-scrollable-table > .p-datatable-thead {\n    top: 0;\n    z-index: 1;\n}\n\n.p-datatable-scrollable-table > .p-datatable-frozen-tbody {\n    position: sticky;\n    z-index: 1;\n}\n\n.p-datatable-scrollable-table>.p-datatable-tfoot {\n    bottom: 0;\n    z-index: 1;\n}\n\n.p-datatable-scrollable .p-datatable-frozen-column {\n    position: sticky;\n    background: ".concat(dt('datatable.header.cell.background'), ";\n}\n\n.p-datatable-scrollable th.p-datatable-frozen-column {\n    z-index: 1;\n}\n\n.p-datatable-scrollable > .p-datatable-table-container > .p-datatable-table > .p-datatable-thead,\n.p-datatable-scrollable > .p-datatable-table-container > .p-virtualscroller > .p-datatable-table > .p-datatable-thead {\n    background: ").concat(dt('datatable.header.cell.background'), ";\n}\n\n.p-datatable-scrollable > .p-datatable-table-container > .p-datatable-table > .p-datatable-tfoot,\n.p-datatable-scrollable > .p-datatable-table-container > .p-virtualscroller > .p-datatable-table > .p-datatable-tfoot {\n    background: ").concat(dt('datatable.footer.cell.background'), ";\n}\n\n.p-datatable-flex-scrollable {\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n}\n\n.p-datatable-flex-scrollable > .p-datatable-table-container {\n    display: flex;\n    flex-direction: column;\n    flex: 1;\n    height: 100%;\n}\n\n.p-datatable-scrollable-table > .p-datatable-tbody > .p-datatable-row-group-header {\n    position: sticky;\n    z-index: 1;\n}\n\n.p-datatable-resizable-table > .p-datatable-thead > tr > th,\n.p-datatable-resizable-table > .p-datatable-tfoot > tr > td,\n.p-datatable-resizable-table > .p-datatable-tbody > tr > td {\n    overflow: hidden;\n    white-space: nowrap;\n}\n\n.p-datatable-resizable-table > .p-datatable-thead > tr > th.p-datatable-resizable-column:not(.p-datatable-frozen-column) {\n    background-clip: padding-box;\n    position: relative;\n}\n\n.p-datatable-resizable-table-fit > .p-datatable-thead > tr > th.p-datatable-resizable-column:last-child .p-datatable-column-resizer {\n    display: none;\n}\n\n.p-datatable-column-resizer {\n    display: block;\n    position: absolute;\n    top: 0;\n    right: 0;\n    margin: 0;\n    width: ").concat(dt('datatable.column.resizer.width'), ";\n    height: 100%;\n    padding: 0px;\n    cursor: col-resize;\n    border: 1px solid transparent;\n}\n\n.p-datatable-column-header-content {\n    display: flex;\n    align-items: center;\n    gap: ").concat(dt('datatable.header.cell.gap'), ";\n}\n\n.p-datatable-column-resize-indicator {\n    width: ").concat(dt('datatable.resize.indicator.width'), ";\n    position: absolute;\n    z-index: 10;\n    display: none;\n    background: ").concat(dt('datatable.resize.indicator.color'), ";\n}\n\n.p-datatable-row-reorder-indicator-up,\n.p-datatable-row-reorder-indicator-down {\n    position: absolute;\n    display: none;\n}\n\n.p-datatable-reorderable-column,\n.p-datatable-reorderable-row-handle {\n    cursor: move;\n}\n\n.p-datatable-mask {\n    position: absolute;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 2;\n}\n\n.p-datatable-inline-filter {\n    display: flex;\n    align-items: center;\n    width: 100%;\n    gap: ").concat(dt('datatable.filter.inline.gap'), ";\n}\n\n.p-datatable-inline-filter .p-datatable-filter-element-container {\n    flex: 1 1 auto;\n    width: 1%;\n}\n\n.p-datatable-filter-overlay {\n    background: ").concat(dt('datatable.filter.overlay.select.background'), ";\n    color: ").concat(dt('datatable.filter.overlay.select.color'), ";\n    border: 1px solid ").concat(dt('datatable.filter.overlay.select.border.color'), ";\n    border-radius: ").concat(dt('datatable.filter.overlay.select.border.radius'), ";\n    box-shadow: ").concat(dt('datatable.filter.overlay.select.shadow'), ";\n    min-width: 12.5rem;\n}\n\n.p-datatable-filter-constraint-list {\n    margin: 0;\n    list-style: none;\n    display: flex;\n    flex-direction: column;\n    padding: ").concat(dt('datatable.filter.constraint.list.padding'), ";\n    gap: ").concat(dt('datatable.filter.constraint.list.gap'), ";\n}\n\n.p-datatable-filter-constraint {\n    padding: ").concat(dt('datatable.filter.constraint.padding'), ";\n    color: ").concat(dt('datatable.filter.constraint.color'), ";\n    border-radius: ").concat(dt('datatable.filter.constraint.border.radius'), ";\n    cursor: pointer;\n    transition: background ").concat(dt('datatable.transition.duration'), ", color ").concat(dt('datatable.transition.duration'), ", border-color ").concat(dt('datatable.transition.duration'), ",\n        box-shadow ").concat(dt('datatable.transition.duration'), ";\n}\n\n.p-datatable-filter-constraint-selected {\n    background: ").concat(dt('datatable.filter.constraint.selected.background'), ";\n    color: ").concat(dt('datatable.filter.constraint.selected.color'), ";\n}\n\n.p-datatable-filter-constraint:not(.p-datatable-filter-constraint-selected):not(.p-disabled):hover {\n    background: ").concat(dt('datatable.filter.constraint.focus.background'), ";\n    color: ").concat(dt('datatable.filter.constraint.focus.color'), ";\n}\n\n.p-datatable-filter-constraint:focus-visible {\n    outline: 0 none;\n    background: ").concat(dt('datatable.filter.constraint.focus.background'), ";\n    color: ").concat(dt('datatable.filter.constraint.focus.color'), ";\n}\n\n.p-datatable-filter-constraint-selected:focus-visible {\n    outline: 0 none;\n    background: ").concat(dt('datatable.filter.constraint.selected.focus.background'), ";\n    color: ").concat(dt('datatable.filter.constraint.selected.focus.color'), ";\n}\n\n.p-datatable-filter-constraint-separator {\n    border-top: 1px solid ").concat(dt('datatable.filter.constraint.separator.border.color'), ";\n}\n\n.p-datatable-popover-filter {\n    display: inline-flex;\n    margin-left: auto;\n}\n\n.p-datatable-filter-overlay-popover {\n    background: ").concat(dt('datatable.filter.overlay.popover.background'), ";\n    color: ").concat(dt('datatable.filter.overlay.popover.color'), ";\n    border: 1px solid ").concat(dt('datatable.filter.overlay.popover.border.color'), ";\n    border-radius: ").concat(dt('datatable.filter.overlay.popover.border.radius'), ";\n    box-shadow: ").concat(dt('datatable.filter.overlay.popover.shadow'), ";\n    min-width: 12.5rem;\n    padding: ").concat(dt('datatable.filter.overlay.popover.padding'), ";\n    display: flex;\n    flex-direction: column;\n    gap: ").concat(dt('datatable.filter.overlay.popover.gap'), ";\n}\n\n.p-datatable-filter-operator-dropdown {\n    width: 100%;\n}\n\n.p-datatable-filter-rule-list,\n.p-datatable-filter-rule {\n    display: flex;\n    flex-direction: column;\n    gap: ").concat(dt('datatable.filter.overlay.popover.gap'), ";\n}\n\n.p-datatable-filter-rule {\n    border-bottom: 1px solid ").concat(dt('datatable.filter.rule.border.color'), ";\n}\n\n.p-datatable-filter-rule:last-child {\n    border-bottom: 0 none;\n}\n\n.p-datatable-filter-add-rule-button {\n    width: 100%;\n}\n\n.p-datatable-filter-remove-button {\n    width: 100%;\n}\n\n.p-datatable-filter-buttonbar {\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n}\n\n.p-datatable-virtualscroller-spacer {\n    display: flex;\n}\n\n.p-datatable .p-virtualscroller .p-virtualscroller-loading {\n    transform: none !important;\n    min-height: 0;\n    position: sticky;\n    top: 0;\n    left: 0;\n}\n\n.p-datatable-paginator-top {\n    border-color: ").concat(dt('datatable.paginator.top.border.color'), ";\n    border-style: solid;\n    border-width: ").concat(dt('datatable.paginator.top.border.width'), ";\n}\n\n.p-datatable-paginator-bottom {\n    border-color: ").concat(dt('datatable.paginator.bottom.border.color'), ";\n    border-style: solid;\n    border-width: ").concat(dt('datatable.paginator.bottom.border.width'), ";\n}\n\n.p-datatable-header {\n    background: ").concat(dt('datatable.header.background'), ";\n    color: ").concat(dt('datatable.header.color'), ";\n    border-color: ").concat(dt('datatable.header.border.color'), ";\n    border-style: solid;\n    border-width: ").concat(dt('datatable.header.border.width'), ";\n    padding: ").concat(dt('datatable.header.padding'), ";\n}\n\n.p-datatable-footer {\n    background: ").concat(dt('datatable.footer.background'), ";\n    color: ").concat(dt('datatable.footer.color'), ";\n    border-color: ").concat(dt('datatable.footer.border.color'), ";\n    border-style: solid;\n    border-width: ").concat(dt('datatable.footer.border.width'), ";\n    padding: ").concat(dt('datatable.footer.padding'), ";\n}\n\n.p-datatable-header-cell {\n    padding: ").concat(dt('datatable.header.cell.padding'), ";\n    background: ").concat(dt('datatable.header.cell.background'), ";\n    border-color: ").concat(dt('datatable.header.cell.border.color'), ";\n    border-style: solid;\n    border-width: 0 0 1px 0;\n    color: ").concat(dt('datatable.header.cell.color'), ";\n    font-weight: normal;\n    text-align: left;\n    transition: background ").concat(dt('datatable.transition.duration'), ", color ").concat(dt('datatable.transition.duration'), ", border-color ").concat(dt('datatable.transition.duration'), ",\n            outline-color ").concat(dt('datatable.transition.duration'), ", box-shadow ").concat(dt('datatable.transition.duration'), ";\n}\n\n.p-datatable-column-title {\n    font-weight: ").concat(dt('datatable.column.title.font.weight'), ";\n}\n\n.p-datatable-tbody > tr {\n    outline-color: transparent;\n    background: ").concat(dt('datatable.row.background'), ";\n    color: ").concat(dt('datatable.row.color'), ";\n    transition: background ").concat(dt('datatable.transition.duration'), ", color ").concat(dt('datatable.transition.duration'), ", border-color ").concat(dt('datatable.transition.duration'), ",\n            outline-color ").concat(dt('datatable.transition.duration'), ", box-shadow ").concat(dt('datatable.transition.duration'), ";\n}\n\n.p-datatable-tbody > tr > td {\n    text-align: left;\n    border-color: ").concat(dt('datatable.body.cell.border.color'), ";\n    border-style: solid;\n    border-width: 0 0 1px 0;\n    padding: ").concat(dt('datatable.body.cell.padding'), ";\n}\n\n.p-datatable-hoverable .p-datatable-tbody > tr:not(.p-datatable-row-selected):hover {\n    background: ").concat(dt('datatable.row.hover.background'), ";\n    color: ").concat(dt('datatable.row.hover.color'), ";\n}\n\n.p-datatable-tbody > tr.p-datatable-row-selected {\n    background: ").concat(dt('datatable.row.selected.background'), ";\n    color: ").concat(dt('datatable.row.selected.color'), ";\n}\n\n.p-datatable-tbody > tr:has(+ .p-datatable-row-selected) > td {\n    border-bottom-color: ").concat(dt('datatable.body.cell.selected.border.color'), ";\n}\n\n.p-datatable-tbody > tr.p-datatable-row-selected > td {\n    border-bottom-color: ").concat(dt('datatable.body.cell.selected.border.color'), ";\n}\n\n.p-datatable-tbody > tr:focus-visible,\n.p-datatable-tbody > tr.p-datatable-contextmenu-row-selected {\n    box-shadow: ").concat(dt('datatable.body.cell.focus.ring.shadow'), ";\n    outline: ").concat(dt('datatable.body.cell.focus.ring.width'), " ").concat(dt('datatable.body.cell.focus.ring.style'), " ").concat(dt('datatable.body.cell.focus.ring.color'), ";\n    outline-offset: ").concat(dt('datatable.body.cell.focus.ring.offset'), ";\n}\n\n.p-datatable-tfoot > tr > td {\n    text-align: left;\n    padding: ").concat(dt('datatable.footer.cell.padding'), ";\n    border-color: ").concat(dt('datatable.footer.cell.border.color'), ";\n    border-style: solid;\n    border-width: 0 0 1px 0;\n    color: ").concat(dt('datatable.footer.cell.color'), ";\n    background: ").concat(dt('datatable.footer.cell.background'), ";\n}\n\n.p-datatable-column-footer {\n    font-weight: ").concat(dt('datatable.column.footer.font.weight'), ";\n}\n\n.p-datatable-sortable-column {\n    cursor: pointer;\n    user-select: none;\n    outline-color: transparent;\n}\n\n.p-datatable-column-title,\n.p-datatable-sort-icon,\n.p-datatable-sort-badge {\n    vertical-align: middle;\n}\n\n.p-datatable-sort-icon {\n    color: ").concat(dt('datatable.sort.icon.color'), ";\n    transition: color ").concat(dt('datatable.transition.duration'), ";\n}\n\n.p-datatable-sortable-column:not(.p-datatable-column-sorted):hover {\n    background: ").concat(dt('datatable.header.cell.hover.background'), ";\n    color: ").concat(dt('datatable.header.cell.hover.color'), ";\n}\n\n.p-datatable-sortable-column:not(.p-datatable-column-sorted):hover .p-datatable-sort-icon {\n    color: ").concat(dt('datatable.sort.icon.hover.color'), ";\n}\n\n.p-datatable-column-sorted {\n    background: ").concat(dt('datatable.header.cell.selected.background'), ";\n    color: ").concat(dt('datatable.header.cell.selected.color'), ";\n}\n\n.p-datatable-column-sorted .p-datatable-sort-icon {\n    color: ").concat(dt('datatable.header.cell.selected.color'), ";\n}\n\n.p-datatable-sortable-column:focus-visible {\n    box-shadow: ").concat(dt('datatable.header.cell.focus.ring.shadow'), ";\n    outline: ").concat(dt('datatable.header.cell.focus.ring.width'), " ").concat(dt('datatable.header.cell.focus.ring.style'), " ").concat(dt('datatable.header.cell.focus.ring.color'), ";\n    outline-offset: ").concat(dt('datatable.header.cell.focus.ring.offset'), ";\n}\n\n.p-datatable-hoverable .p-datatable-selectable-row {\n    cursor: pointer;\n}\n\n.p-datatable-tbody > tr.p-datatable-dragpoint-top > td {\n    box-shadow: inset 0 2px 0 0 ").concat(dt('datatable.drop.point.color'), ";\n}\n\n.p-datatable-tbody > tr.p-datatable-dragpoint-bottom > td {\n    box-shadow: inset 0 -2px 0 0 ").concat(dt('datatable.drop.point.color'), ";\n}\n\n.p-datatable-loading-icon {\n    font-size: ").concat(dt('datatable.loading.icon.size'), ";\n    width: ").concat(dt('datatable.loading.icon.size'), ";\n    height: ").concat(dt('datatable.loading.icon.size'), ";\n}\n\n.p-datatable-gridlines .p-datatable-header {\n    border-width: 1px 1px 0 1px;\n}\n\n.p-datatable-gridlines .p-datatable-footer {\n    border-width: 0 1px 1px 1px;\n}\n\n.p-datatable-gridlines .p-datatable-paginator-top {\n    border-width: 1px 1px 0 1px;\n}\n\n.p-datatable-gridlines .p-datatable-paginator-bottom {\n    border-width: 0 1px 1px 1px;\n}\n\n.p-datatable-gridlines .p-datatable-thead > tr > th {\n    border-width: 1px 0 1px 1px;\n}\n\n.p-datatable-gridlines .p-datatable-thead > tr > th:last-child {\n    border-width: 1px;\n}\n\n.p-datatable-gridlines .p-datatable-tbody > tr > td {\n    border-width: 1px 0 0 1px;\n}\n\n.p-datatable-gridlines .p-datatable-tbody > tr > td:last-child {\n    border-width: 1px 1px 0 1px;\n}\n\np-datatable-gridlines .p-datatable-tbody > tr:last-child > td {\n    border-width: 1px 0 1px 1px;\n}\n\n.p-datatable-gridlines .p-datatable-tbody > tr:last-child > td:last-child {\n    border-width: 1px;\n}\n\n.p-datatable-gridlines .p-datatable-tfoot > tr > td {\n    border-width: 1px 0 1px 1px;\n}\n\n.p-datatable-gridlines .p-datatable-tfoot > tr > td:last-child {\n    border-width: 1px 1px 1px 1px;\n}\n\n.p-datatable.p-datatable-gridlines .p-datatable-thead + .p-datatable-tfoot > tr > td {\n    border-width: 0 0 1px 1px;\n}\n\n.p-datatable.p-datatable-gridlines .p-datatable-thead + .p-datatable-tfoot > tr > td:last-child {\n    border-width: 0 1px 1px 1px;\n}\n\n.p-datatable.p-datatable-gridlines:has(.p-datatable-thead):has(.p-datatable-tbody) .p-datatable-tbody > tr > td {\n    border-width: 0 0 1px 1px;\n}\n\n.p-datatable.p-datatable-gridlines:has(.p-datatable-thead):has(.p-datatable-tbody) .p-datatable-tbody > tr > td:last-child {\n    border-width: 0 1px 1px 1px;\n}\n\n.p-datatable.p-datatable-gridlines:has(.p-datatable-tbody):has(.p-datatable-tfoot) .p-datatable-tbody > tr:last-child > td {\n    border-width: 0 0 0 1px;\n}\n\n.p-datatable.p-datatable-gridlines:has(.p-datatable-tbody):has(.p-datatable-tfoot) .p-datatable-tbody > tr:last-child > td:last-child {\n    border-width: 0 1px 0 1px;\n}\n\n.p-datatable.p-datatable-striped .p-datatable-tbody > tr.p-row-odd {\n    background: ").concat(dt('datatable.row.striped.background'), ";\n}\n\n.p-datatable.p-datatable-striped .p-datatable-tbody > tr.p-row-odd.p-datatable-row-selected {\n    background: ").concat(dt('datatable.row.selected.background'), ";\n    color: ").concat(dt('datatable.row.selected.color'), ";\n}\n\n.p-datatable.p-datatable-sm .p-datatable-header {\n    padding: 0.375rem 0.5rem;\n}\n\n.p-datatable.p-datatable-sm .p-datatable-thead > tr > th {\n    padding: 0.375rem 0.5rem;\n}\n\n.p-datatable.p-datatable-sm .p-datatable-tbody > tr > td {\n    padding: 0.375rem 0.5rem;\n}\n\n.p-datatable.p-datatable-sm .p-datatable-tfoot > tr > td {\n    padding: 0.375rem 0.5rem;\n}\n\n.p-datatable.p-datatable-sm .p-datatable-footer {\n    padding: 0.375rem 0.5rem;\n}\n\n.p-datatable.p-datatable-lg .p-datatable-header {\n    padding: 0.9375rem 1.25rem;\n}\n\n.p-datatable.p-datatable-lg .p-datatable-thead > tr > th {\n    padding: 0.9375rem 1.25rem;\n}\n\n.p-datatable.p-datatable-lg .p-datatable-tbody>tr>td {\n    padding: 0.9375rem 1.25rem;\n}\n\n.p-datatable.p-datatable-lg .p-datatable-tfoot>tr>td {\n    padding: 0.9375rem 1.25rem;\n}\n\n.p-datatable.p-datatable-lg .p-datatable-footer {\n    padding: 0.9375rem 1.25rem;\n}\n\n.p-datatable-row-toggle-button {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    overflow: hidden;\n    position: relative;\n    width: ").concat(dt('datatable.row.toggle.button.size'), ";\n    height: ").concat(dt('datatable.row.toggle.button.size'), ";\n    color: ").concat(dt('datatable.row.toggle.button.color'), ";\n    border: 0 none;\n    background: transparent;\n    cursor: pointer;\n    border-radius: ").concat(dt('datatable.row.toggle.button.border.radius'), ";\n    transition: background ").concat(dt('datatable.transition.duration'), ", color ").concat(dt('datatable.transition.duration'), ", border-color ").concat(dt('datatable.transition.duration'), ",\n            outline-color ").concat(dt('datatable.transition.duration'), ", box-shadow ").concat(dt('datatable.transition.duration'), ";\n    outline-color: transparent;\n    user-select: none;\n}\n\n.p-datatable-row-toggle-button:enabled:hover {\n    color: ").concat(dt('datatable.row.toggle.button.hover.color'), ";\n    background: ").concat(dt('datatable.row.toggle.button.hover.background'), ";\n}\n\n.p-datatable-tbody > tr.p-datatable-row-selected .p-datatable-row-toggle-button:hover {\n    background: ").concat(dt('datatable.row.toggle.button.selected.hover.background'), ";\n    ").concat(dt('datatable.row.toggle.button.selected.hover.color'), ";\n}\n\n.p-datatable-row-toggle-button:focus-visible {\n    box-shadow: ").concat(dt('datatable.row.toggle.button.focus.ring.shadow'), ";\n    outline: ").concat(dt('datatable.row.toggle.button.focus.ring.width'), " ").concat(dt('datatable.row.toggle.button.focus.ring.style'), " ").concat(dt('datatable.row.toggle.button.focus.ring.color'), ";\n    outline-offset: ").concat(dt('datatable.row.toggle.button.focus.ring.offset'), ";\n}\n");
};
var classes$7 = {
  root: function root(_ref2) {
    var props = _ref2.props;
    return ['p-datatable p-component', {
      'p-datatable-hoverable': props.rowHover || props.selectionMode,
      'p-datatable-resizable': props.resizableColumns,
      'p-datatable-resizable-fit': props.resizableColumns && props.columnResizeMode === 'fit',
      'p-datatable-scrollable': props.scrollable,
      'p-datatable-flex-scrollable': props.scrollable && props.scrollHeight === 'flex',
      'p-datatable-striped': props.stripedRows,
      'p-datatable-gridlines': props.showGridlines,
      'p-datatable-sm': props.size === 'small',
      'p-datatable-lg': props.size === 'large'
    }];
  },
  mask: 'p-datatable-mask p-overlay-mask',
  loadingIcon: 'p-datatable-loading-icon',
  header: 'p-datatable-header',
  pcPaginator: function pcPaginator(_ref3) {
    var position = _ref3.position;
    return 'p-datatable-paginator-' + position;
  },
  tableContainer: 'p-datatable-table-container',
  table: function table(_ref4) {
    var props = _ref4.props;
    return ['p-datatable-table', {
      'p-datatable-scrollable-table': props.scrollable,
      'p-datatable-resizable-table': props.resizableColumns,
      'p-datatable-resizable-table-fit': props.resizableColumns && props.columnResizeMode === 'fit'
    }];
  },
  thead: 'p-datatable-thead',
  headerCell: function headerCell(_ref5) {
    var instance = _ref5.instance,
      props = _ref5.props,
      column = _ref5.column;
    return column && !instance.columnProp(column, 'hidden') && (props.rowGroupMode !== 'subheader' || props.groupRowsBy !== instance.columnProp(column, 'field')) ? ['p-datatable-header-cell', {
      'p-datatable-frozen-column': instance.columnProp(column, 'frozen')
    }] : ['p-datatable-header-cell', {
      'p-datatable-sortable-column': instance.columnProp('sortable'),
      'p-datatable-resizable-column': instance.resizableColumns,
      'p-datatable-column-sorted': instance.isColumnSorted(),
      'p-datatable-frozen-column': instance.columnProp('frozen'),
      'p-datatable-reorderable-column': props.reorderableColumns
    }];
  },
  columnResizer: 'p-datatable-column-resizer',
  columnHeaderContent: 'p-datatable-column-header-content',
  columnTitle: 'p-datatable-column-title',
  columnFooter: 'p-datatable-column-footer',
  sortIcon: 'p-datatable-sort-icon',
  pcSortBadge: 'p-datatable-sort-badge',
  filter: function filter(_ref6) {
    var props = _ref6.props;
    return ['p-datatable-filter', {
      'p-datatable-inline-filter': props.display === 'row',
      'p-datatable-popover-filter': props.display === 'menu'
    }];
  },
  filterElementContainer: 'p-datatable-filter-element-container',
  pcColumnFilterButton: 'p-datatable-column-filter-button',
  pcColumnFilterClearButton: 'p-datatable-column-filter-clear-button',
  filterOverlay: function filterOverlay(_ref7) {
    _ref7.instance;
      var props = _ref7.props;
    return ['p-datatable-filter-overlay p-component', {
      'p-datatable-filter-overlay-popover': props.display === 'menu'
    }];
  },
  filterConstraintList: 'p-datatable-filter-constraint-list',
  filterConstraint: function filterConstraint(_ref8) {
    var instance = _ref8.instance,
      matchMode = _ref8.matchMode;
    return ['p-datatable-filter-constraint', {
      'p-datatable-filter-constraint-selected': matchMode && instance.isRowMatchModeSelected(matchMode.value)
    }];
  },
  filterConstraintSeparator: 'p-datatable-filter-constraint-separator',
  filterOperator: 'p-datatable-filter-operator',
  pcFilterOperatorDropdown: 'p-datatable-filter-operator-dropdown',
  filterRuleList: 'p-datatable-filter-rule-list',
  filterRule: 'p-datatable-filter-rule',
  pcFilterConstraintDropdown: 'p-datatable-filter-constraint-dropdown',
  pcFilterRemoveRuleButton: 'p-datatable-filter-remove-rule-button',
  pcFilterAddRuleButton: 'p-datatable-filter-add-rule-button',
  filterButtonbar: 'p-datatable-filter-buttonbar',
  pcFilterClearButton: 'p-datatable-filter-clear-button',
  pcFilterApplyButton: 'p-datatable-filter-apply-button',
  tbody: function tbody(_ref9) {
    var props = _ref9.props;
    return props.frozenRow ? 'p-datatable-tbody p-datatable-frozen-tbody' : 'p-datatable-tbody';
  },
  rowGroupHeader: 'p-datatable-row-group-header',
  rowToggleButton: 'p-datatable-row-toggle-button',
  rowToggleIcon: 'p-datatable-row-toggle-icon',
  row: function row(_ref10) {
    var instance = _ref10.instance,
      props = _ref10.props,
      index = _ref10.index,
      columnSelectionMode = _ref10.columnSelectionMode;
    var rowStyleClass = [];
    if (props.selectionMode) {
      rowStyleClass.push('p-datatable-selectable-row');
    }
    if (props.selection) {
      rowStyleClass.push({
        'p-datatable-row-selected': columnSelectionMode ? instance.isSelected && instance.$parentInstance.$parentInstance.highlightOnSelect : instance.isSelected
      });
    }
    if (props.contextMenuSelection) {
      rowStyleClass.push({
        'p-datatable-contextmenu-row-selected': instance.isSelectedWithContextMenu
      });
    }
    rowStyleClass.push(index % 2 === 0 ? 'p-row-even' : 'p-row-odd');
    return rowStyleClass;
  },
  rowExpansion: 'p-datatable-row-expansion',
  rowGroupFooter: 'p-datatable-row-group-footer',
  emptyMessage: 'p-datatable-empty-message',
  bodyCell: function bodyCell(_ref11) {
    var instance = _ref11.instance;
    return [{
      'p-datatable-frozen-column': instance.columnProp('frozen')
    }];
  },
  reorderableRowHandle: 'p-datatable-reorderable-row-handle',
  pcRowEditorInit: 'p-datatable-row-editor-init',
  pcRowEditorSave: 'p-datatable-row-editor-save',
  pcRowEditorCancel: 'p-datatable-row-editor-cancel',
  tfoot: 'p-datatable-tfoot',
  footerCell: function footerCell(_ref12) {
    var instance = _ref12.instance;
    return [{
      'p-datatable-frozen-column': instance.columnProp('frozen')
    }];
  },
  virtualScrollerSpacer: 'p-datatable-virtualscroller-spacer',
  footer: 'p-datatable-footer',
  columnResizeIndicator: 'p-datatable-column-resize-indicator',
  rowReorderIndicatorUp: 'p-datatable-row-reorder-indicator-up',
  rowReorderIndicatorDown: 'p-datatable-row-reorder-indicator-down'
};
var inlineStyles$3 = {
  tableContainer: {
    overflow: 'auto'
  },
  thead: {
    position: 'sticky'
  },
  tfoot: {
    position: 'sticky'
  }
};
var DataTableStyle = BaseStyle.extend({
  name: 'datatable',
  theme: theme$7,
  classes: classes$7,
  inlineStyles: inlineStyles$3
});

var theme$6 = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-dialog {\n    max-height: 90%;\n    transform: scale(1);\n    border-radius: ".concat(dt('dialog.border.radius'), ";\n    box-shadow: ").concat(dt('dialog.shadow'), ";\n    background: ").concat(dt('dialog.background'), ";\n    border: 1px solid ").concat(dt('dialog.border.color'), ";\n    color: ").concat(dt('dialog.color'), ";\n}\n\n.p-dialog-content {\n    overflow-y: auto;\n    padding: ").concat(dt('dialog.content.padding'), ";\n}\n\n.p-dialog-header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    flex-shrink: 0;\n    padding: ").concat(dt('dialog.header.padding'), ";\n}\n\n.p-dialog-title {\n    font-weight: ").concat(dt('dialog.title.font.weight'), ";\n    font-size: ").concat(dt('dialog.title.font.size'), ";\n}\n\n.p-dialog-footer {\n    flex-shrink: 0;\n    padding: ").concat(dt('dialog.footer.padding'), ";\n    display: flex;\n    justify-content: flex-end;\n    gap: ").concat(dt('dialog.footer.gap'), ";\n}\n\n.p-dialog-header-actions {\n    display: flex;\n    align-items: center;\n    gap: ").concat(dt('dialog.header.gap'), ";\n}\n.p-dialog-enter-active {\n    transition: all 150ms cubic-bezier(0, 0, 0.2, 1);\n}\n\n.p-dialog-leave-active {\n    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.p-dialog-enter-from,\n.p-dialog-leave-to {\n    opacity: 0;\n    transform: scale(0.7);\n}\n\n.p-dialog-top .p-dialog,\n.p-dialog-bottom .p-dialog,\n.p-dialog-left .p-dialog,\n.p-dialog-right .p-dialog,\n.p-dialog-topleft .p-dialog,\n.p-dialog-topright .p-dialog,\n.p-dialog-bottomleft .p-dialog,\n.p-dialog-bottomright .p-dialog {\n    margin: 0.75rem;\n    transform: translate3d(0px, 0px, 0px);\n}\n\n.p-dialog-top .p-dialog-enter-active,\n.p-dialog-top .p-dialog-leave-active,\n.p-dialog-bottom .p-dialog-enter-active,\n.p-dialog-bottom .p-dialog-leave-active,\n.p-dialog-left .p-dialog-enter-active,\n.p-dialog-left .p-dialog-leave-active,\n.p-dialog-right .p-dialog-enter-active,\n.p-dialog-right .p-dialog-leave-active,\n.p-dialog-topleft .p-dialog-enter-active,\n.p-dialog-topleft .p-dialog-leave-active,\n.p-dialog-topright .p-dialog-enter-active,\n.p-dialog-topright .p-dialog-leave-active,\n.p-dialog-bottomleft .p-dialog-enter-active,\n.p-dialog-bottomleft .p-dialog-leave-active,\n.p-dialog-bottomright .p-dialog-enter-active,\n.p-dialog-bottomright .p-dialog-leave-active {\n    transition: all 0.3s ease-out;\n}\n\n.p-dialog-top .p-dialog-enter-from,\n.p-dialog-top .p-dialog-leave-to {\n    transform: translate3d(0px, -100%, 0px);\n}\n\n.p-dialog-bottom .p-dialog-enter-from,\n.p-dialog-bottom .p-dialog-leave-to {\n    transform: translate3d(0px, 100%, 0px);\n}\n\n.p-dialog-left .p-dialog-enter-from,\n.p-dialog-left .p-dialog-leave-to,\n.p-dialog-topleft .p-dialog-enter-from,\n.p-dialog-topleft .p-dialog-leave-to,\n.p-dialog-bottomleft .p-dialog-enter-from,\n.p-dialog-bottomleft .p-dialog-leave-to {\n    transform: translate3d(-100%, 0px, 0px);\n}\n\n.p-dialog-right .p-dialog-enter-from,\n.p-dialog-right .p-dialog-leave-to,\n.p-dialog-topright .p-dialog-enter-from,\n.p-dialog-topright .p-dialog-leave-to,\n.p-dialog-bottomright .p-dialog-enter-from,\n.p-dialog-bottomright .p-dialog-leave-to {\n    transform: translate3d(100%, 0px, 0px);\n}\n\n.p-dialog-maximized {\n    width: 100vw !important;\n    height: 100vh !important;\n    top: 0px !important;\n    left: 0px !important;\n    max-height: 100%;\n    height: 100%;\n    border-radius: 0;\n}\n\n.p-dialog-maximized .p-dialog-content {\n    flex-grow: 1;\n}\n");
};

/* Position */
var inlineStyles$2 = {
  mask: function mask(_ref2) {
    var position = _ref2.position,
      modal = _ref2.modal;
    return {
      position: 'fixed',
      height: '100%',
      width: '100%',
      left: 0,
      top: 0,
      display: 'flex',
      justifyContent: position === 'left' || position === 'topleft' || position === 'bottomleft' ? 'flex-start' : position === 'right' || position === 'topright' || position === 'bottomright' ? 'flex-end' : 'center',
      alignItems: position === 'top' || position === 'topleft' || position === 'topright' ? 'flex-start' : position === 'bottom' || position === 'bottomleft' || position === 'bottomright' ? 'flex-end' : 'center',
      pointerEvents: modal ? 'auto' : 'none'
    };
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'auto'
  }
};
var classes$6 = {
  mask: function mask(_ref3) {
    var props = _ref3.props;
    var positions = ['left', 'right', 'top', 'topleft', 'topright', 'bottom', 'bottomleft', 'bottomright'];
    var pos = positions.find(function (item) {
      return item === props.position;
    });
    return ['p-dialog-mask', {
      'p-overlay-mask p-overlay-mask-enter': props.modal
    }, pos ? "p-dialog-".concat(pos) : ''];
  },
  root: function root(_ref4) {
    var props = _ref4.props,
      instance = _ref4.instance;
    return ['p-dialog p-component', {
      'p-dialog-maximized': props.maximizable && instance.maximized
    }];
  },
  header: 'p-dialog-header',
  title: 'p-dialog-title',
  headerActions: 'p-dialog-header-actions',
  pcMaximizeButton: 'p-dialog-maximize-button',
  pcCloseButton: 'p-dialog-close-button',
  content: 'p-dialog-content',
  footer: 'p-dialog-footer'
};
var DialogStyle = BaseStyle.extend({
  name: 'dialog',
  theme: theme$6,
  classes: classes$6,
  inlineStyles: inlineStyles$2
});

var theme$5 = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-card {\n    background: ".concat(dt('card.background'), ";\n    color: ").concat(dt('card.color'), ";\n    box-shadow: ").concat(dt('card.shadow'), ";\n    border-radius: ").concat(dt('card.border.radius'), ";\n    display: flex;\n    flex-direction: column;\n}\n\n.p-card-caption {\n    display: flex;\n    flex-direction: column;\n    gap: ").concat(dt('card.caption.gap'), ";\n}\n\n.p-card-body {\n    padding: ").concat(dt('card.body.padding'), ";\n    display: flex;\n    flex-direction: column;\n    gap: ").concat(dt('card.body.gap'), ";\n}\n\n.p-card-title {\n    font-size: ").concat(dt('card.title.font.size'), ";\n    font-weight: ").concat(dt('card.title.font.weight'), ";\n}\n\n.p-card-subtitle {\n    color: ").concat(dt('card.subtitle.color'), ";\n}\n");
};
var classes$5 = {
  root: 'p-card p-component',
  header: 'p-card-header',
  body: 'p-card-body',
  caption: 'p-card-caption',
  title: 'p-card-title',
  subtitle: 'p-card-subtitle',
  content: 'p-card-content',
  footer: 'p-card-footer'
};
var CardStyle = BaseStyle.extend({
  name: 'card',
  theme: theme$5,
  classes: classes$5
});

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var theme$4 = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-toast {\n    width: ".concat(dt('toast.width'), ";\n    white-space: pre-line;\n    word-break: break-word;\n}\n\n.p-toast-message {\n    margin: 0 0 1rem 0;\n}\n\n.p-toast-message-icon {\n    flex-shrink: 0;\n    font-size: ").concat(dt('toast.icon.size'), ";\n    width: ").concat(dt('toast.icon.size'), ";\n    height: ").concat(dt('toast.icon.size'), ";\n}\n\n.p-toast-message-content {\n    display: flex;\n    align-items: flex-start;\n    padding: ").concat(dt('toast.content.padding'), ";\n    gap: ").concat(dt('toast.content.gap'), ";\n}\n\n.p-toast-message-text {\n    flex: 1 1 auto;\n    display: flex;\n    flex-direction: column;\n    gap: ").concat(dt('toast.text.gap'), ";\n}\n\n.p-toast-summary {\n    font-weight: ").concat(dt('toast.summary.font.weight'), ";\n    font-size: ").concat(dt('toast.summary.font.size'), ";\n}\n\n.p-toast-detail {\n    font-weight: ").concat(dt('toast.detail.font.weight'), ";\n    font-size: ").concat(dt('toast.detail.font.size'), ";\n}\n\n.p-toast-close-button {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    overflow: hidden;\n    position: relative;\n    cursor: pointer;\n    background: transparent;\n    transition: background ").concat(dt('toast.transition.duration'), ", color ").concat(dt('toast.transition.duration'), ", outline-color ").concat(dt('toast.transition.duration'), ", box-shadow ").concat(dt('toast.transition.duration'), ";\n    outline-color: transparent;\n    color: inherit;\n    width: ").concat(dt('toast.close.button.width'), ";\n    height: ").concat(dt('toast.close.button.height'), ";\n    border-radius: ").concat(dt('toast.close.button.border.radius'), ";\n    margin: -25% 0 0 0;\n    right: -25%;\n    padding: 0;\n    border: none;\n    user-select: none;\n}\n\n.p-toast-message-info,\n.p-toast-message-success,\n.p-toast-message-warn,\n.p-toast-message-error,\n.p-toast-message-secondary,\n.p-toast-message-contrast {\n    border-width: ").concat(dt('toast.border.width'), ";\n    border-style: solid;\n    backdrop-filter: blur(").concat(dt('toast.blur'), ");\n    border-radius: ").concat(dt('toast.border.radius'), ";\n}\n\n.p-toast-close-icon {\n    font-size: ").concat(dt('toast.close.icon.size'), ";\n    width: ").concat(dt('toast.close.icon.size'), ";\n    height: ").concat(dt('toast.close.icon.size'), ";\n}\n\n.p-toast-close-button:focus-visible {\n    outline-width: ").concat(dt('focus.ring.width'), ";\n    outline-style: ").concat(dt('focus.ring.style'), ";\n    outline-offset: ").concat(dt('focus.ring.offset'), ";\n}\n\n.p-toast-message-info {\n    background: ").concat(dt('toast.info.background'), ";\n    border-color: ").concat(dt('toast.info.border.color'), ";\n    color: ").concat(dt('toast.info.color'), ";\n    box-shadow: ").concat(dt('toast.info.shadow'), ";\n}\n\n.p-toast-message-info .p-toast-detail {\n    color: ").concat(dt('toast.info.detail.color'), ";\n}\n\n.p-toast-message-info .p-toast-close-button:focus-visible {\n    outline-color: ").concat(dt('toast.info.close.button.focus.ring.color'), ";\n    box-shadow: ").concat(dt('toast.info.close.button.focus.ring.shadow'), ";\n}\n\n.p-toast-message-info .p-toast-close-button:hover {\n    background: ").concat(dt('toast.info.close.button.hover.background'), ";\n}\n\n.p-toast-message-success {\n    background: ").concat(dt('toast.success.background'), ";\n    border-color: ").concat(dt('toast.success.border.color'), ";\n    color: ").concat(dt('toast.success.color'), ";\n    box-shadow: ").concat(dt('toast.success.shadow'), ";\n}\n\n.p-toast-message-success .p-toast-detail {\n    color: ").concat(dt('toast.success.detail.color'), ";\n}\n\n.p-toast-message-success .p-toast-close-button:focus-visible {\n    outline-color: ").concat(dt('toast.success.close.button.focus.ring.color'), ";\n    box-shadow: ").concat(dt('toast.success.close.button.focus.ring.shadow'), ";\n}\n\n.p-toast-message-success .p-toast-close-button:hover {\n    background: ").concat(dt('toast.success.close.button.hover.background'), ";\n}\n\n.p-toast-message-warn {\n    background: ").concat(dt('toast.warn.background'), ";\n    border-color: ").concat(dt('toast.warn.border.color'), ";\n    color: ").concat(dt('toast.warn.color'), ";\n    box-shadow: ").concat(dt('toast.warn.shadow'), ";\n}\n\n.p-toast-message-warn .p-toast-detail {\n    color: ").concat(dt('toast.warn.detail.color'), ";\n}\n\n.p-toast-message-warn .p-toast-close-button:focus-visible {\n    outline-color: ").concat(dt('toast.warn.close.button.focus.ring.color'), ";\n    box-shadow: ").concat(dt('toast.warn.close.button.focus.ring.shadow'), ";\n}\n\n.p-toast-message-warn .p-toast-close-button:hover {\n    background: ").concat(dt('toast.warn.close.button.hover.background'), ";\n}\n\n.p-toast-message-error {\n    background: ").concat(dt('toast.error.background'), ";\n    border-color: ").concat(dt('toast.error.border.color'), ";\n    color: ").concat(dt('toast.error.color'), ";\n    box-shadow: ").concat(dt('toast.error.shadow'), ";\n}\n\n.p-toast-message-error .p-toast-detail {\n    color: ").concat(dt('toast.error.detail.color'), ";\n}\n\n.p-toast-message-error .p-toast-close-button:focus-visible {\n    outline-color: ").concat(dt('toast.error.close.button.focus.ring.color'), ";\n    box-shadow: ").concat(dt('toast.error.close.button.focus.ring.shadow'), ";\n}\n\n.p-toast-message-error .p-toast-close-button:hover {\n    background: ").concat(dt('toast.error.close.button.hover.background'), ";\n}\n\n.p-toast-message-secondary {\n    background: ").concat(dt('toast.secondary.background'), ";\n    border-color: ").concat(dt('toast.secondary.border.color'), ";\n    color: ").concat(dt('toast.secondary.color'), ";\n    box-shadow: ").concat(dt('toast.secondary.shadow'), ";\n}\n\n.p-toast-message-secondary .p-toast-detail {\n    color: ").concat(dt('toast.secondary.detail.color'), ";\n}\n\n.p-toast-message-secondary .p-toast-close-button:focus-visible {\n    outline-color: ").concat(dt('toast.secondary.close.button.focus.ring.color'), ";\n    box-shadow: ").concat(dt('toast.secondary.close.button.focus.ring.shadow'), ";\n}\n\n.p-toast-message-secondary .p-toast-close-button:hover {\n    background: ").concat(dt('toast.secondary.close.button.hover.background'), ";\n}\n\n.p-toast-message-contrast {\n    background: ").concat(dt('toast.contrast.background'), ";\n    border-color: ").concat(dt('toast.contrast.border.color'), ";\n    color: ").concat(dt('toast.contrast.color'), ";\n    box-shadow: ").concat(dt('toast.contrast.shadow'), ";\n}\n\n.p-toast-message-contrast .p-toast-detail {\n    color: ").concat(dt('toast.contrast.detail.color'), ";\n}\n\n.p-toast-message-contrast .p-toast-close-button:focus-visible {\n    outline-color: ").concat(dt('toast.contrast.close.button.focus.ring.color'), ";\n    box-shadow: ").concat(dt('toast.contrast.close.button.focus.ring.shadow'), ";\n}\n\n.p-toast-message-contrast .p-toast-close-button:hover {\n    background: ").concat(dt('toast.contrast.close.button.hover.background'), ";\n}\n\n.p-toast-top-center {\n    transform: translateX(-50%);\n}\n\n.p-toast-bottom-center {\n    transform: translateX(-50%);\n}\n\n.p-toast-center {\n    min-width: 20vw;\n    transform: translate(-50%, -50%);\n}\n\n.p-toast-message-enter-from {\n    opacity: 0;\n    transform: translateY(50%);\n}\n\n.p-toast-message-leave-from {\n    max-height: 1000px;\n}\n\n.p-toast .p-toast-message.p-toast-message-leave-to {\n    max-height: 0;\n    opacity: 0;\n    margin-bottom: 0;\n    overflow: hidden;\n}\n\n.p-toast-message-enter-active {\n    transition: transform 0.3s, opacity 0.3s;\n}\n\n.p-toast-message-leave-active {\n    transition: max-height 0.45s cubic-bezier(0, 1, 0, 1), opacity 0.3s, margin-bottom 0.3s;\n}\n");
};

// Position
var inlineStyles$1 = {
  root: function root(_ref2) {
    var position = _ref2.position;
    return {
      position: 'fixed',
      top: position === 'top-right' || position === 'top-left' || position === 'top-center' ? '20px' : position === 'center' ? '50%' : null,
      right: (position === 'top-right' || position === 'bottom-right') && '20px',
      bottom: (position === 'bottom-left' || position === 'bottom-right' || position === 'bottom-center') && '20px',
      left: position === 'top-left' || position === 'bottom-left' ? '20px' : position === 'center' || position === 'top-center' || position === 'bottom-center' ? '50%' : null
    };
  }
};
var classes$4 = {
  root: function root(_ref3) {
    var props = _ref3.props;
    return ['p-toast p-component p-toast-' + props.position];
  },
  message: function message(_ref4) {
    var props = _ref4.props;
    return ['p-toast-message', {
      'p-toast-message-info': props.message.severity === 'info' || props.message.severity === undefined,
      'p-toast-message-warn': props.message.severity === 'warn',
      'p-toast-message-error': props.message.severity === 'error',
      'p-toast-message-success': props.message.severity === 'success',
      'p-toast-message-secondary': props.message.severity === 'secondary',
      'p-toast-message-contrast': props.message.severity === 'contrast'
    }];
  },
  messageContent: 'p-toast-message-content',
  messageIcon: function messageIcon(_ref5) {
    var props = _ref5.props;
    return ['p-toast-message-icon', _defineProperty(_defineProperty(_defineProperty(_defineProperty({}, props.infoIcon, props.message.severity === 'info'), props.warnIcon, props.message.severity === 'warn'), props.errorIcon, props.message.severity === 'error'), props.successIcon, props.message.severity === 'success')];
  },
  messageText: 'p-toast-message-text',
  summary: 'p-toast-summary',
  detail: 'p-toast-detail',
  closeButton: 'p-toast-close-button',
  closeIcon: 'p-toast-close-icon'
};
var ToastStyle = BaseStyle.extend({
  name: 'toast',
  theme: theme$4,
  classes: classes$4,
  inlineStyles: inlineStyles$1
});

var theme$3 = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-confirmdialog .p-dialog-content {\n    display: flex;\n    align-items: center;\n    gap:  ".concat(dt('confirmdialog.content.gap'), ";\n}\n\n.p-confirmdialog-icon {\n    color: ").concat(dt('confirmdialog.icon.color'), ";\n    font-size: ").concat(dt('confirmdialog.icon.size'), ";\n    width: ").concat(dt('confirmdialog.icon.size'), ";\n    height: ").concat(dt('confirmdialog.icon.size'), ";\n}\n");
};
var classes$3 = {
  root: 'p-confirmdialog',
  icon: 'p-confirmdialog-icon',
  message: 'p-confirmdialog-message',
  pcRejectButton: 'p-confirmdialog-reject-button',
  pcAcceptButton: 'p-confirmdialog-accept-button'
};
var ConfirmDialogStyle = BaseStyle.extend({
  name: 'confirmdialog',
  theme: theme$3,
  classes: classes$3
});

var theme$2 = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-checkbox {\n    position: relative;\n    display: inline-flex;\n    user-select: none;\n    vertical-align: bottom;\n    width: ".concat(dt('checkbox.width'), ";\n    height: ").concat(dt('checkbox.height'), ";\n}\n\n.p-checkbox-input {\n    cursor: pointer;\n    appearance: none;\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    padding: 0;\n    margin: 0;\n    opacity: 0;\n    z-index: 1;\n    outline: 0 none;\n    border: 1px solid transparent;\n    border-radius: ").concat(dt('checkbox.border.radius'), ";\n}\n\n.p-checkbox-box {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    border-radius: ").concat(dt('checkbox.border.radius'), ";\n    border: 1px solid ").concat(dt('checkbox.border.color'), ";\n    background: ").concat(dt('checkbox.background'), ";\n    width: ").concat(dt('checkbox.width'), ";\n    height: ").concat(dt('checkbox.height'), ";\n    transition: background ").concat(dt('checkbox.transition.duration'), ", color ").concat(dt('checkbox.transition.duration'), ", border-color ").concat(dt('checkbox.transition.duration'), ", box-shadow ").concat(dt('checkbox.transition.duration'), ", outline-color ").concat(dt('checkbox.transition.duration'), ";\n    outline-color: transparent;\n    box-shadow: ").concat(dt('checkbox.shadow'), ";\n}\n\n.p-checkbox-icon {\n    transition-duration: ").concat(dt('checkbox.transition.duration'), ";\n    color: ").concat(dt('checkbox.icon.color'), ";\n    font-size: ").concat(dt('checkbox.icon.size'), ";\n    width: ").concat(dt('checkbox.icon.size'), ";\n    height: ").concat(dt('checkbox.icon.size'), ";\n}\n\n.p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {\n    border-color: ").concat(dt('checkbox.hover.border.color'), ";\n}\n\n.p-checkbox-checked .p-checkbox-box {\n    border-color: ").concat(dt('checkbox.checked.border.color'), ";\n    background: ").concat(dt('checkbox.checked.background'), ";\n}\n\n.p-checkbox-checked .p-checkbox-icon {\n    color: ").concat(dt('checkbox.icon.checked.color'), ";\n}\n\n.p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {\n    background: ").concat(dt('checkbox.checked.hover.background'), ";\n    border-color: ").concat(dt('checkbox.checked.hover.border.color'), ";\n}\n\n.p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-icon {\n    color: ").concat(dt('checkbox.icon.checked.hover.color'), ";\n}\n\n.p-checkbox:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {\n    border-color: ").concat(dt('checkbox.focus.border.color'), ";\n    box-shadow: ").concat(dt('checkbox.focus.ring.shadow'), ";\n    outline: ").concat(dt('checkbox.focus.ring.width'), " ").concat(dt('checkbox.focus.ring.style'), " ").concat(dt('checkbox.focus.ring.color'), ";\n    outline-offset: ").concat(dt('checkbox.focus.ring.offset'), ";\n}\n\n.p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {\n    border-color: ").concat(dt('checkbox.checked.focus.border.color'), ";\n}\n\n.p-checkbox.p-invalid > .p-checkbox-box {\n    border-color: ").concat(dt('checkbox.invalid.border.color'), ";\n}\n\n.p-checkbox.p-variant-filled .p-checkbox-box {\n    background: ").concat(dt('checkbox.filled.background'), ";\n}\n\n.p-checkbox-checked.p-variant-filled .p-checkbox-box {\n    background: ").concat(dt('checkbox.checked.background'), ";\n}\n\n.p-checkbox-checked.p-variant-filled:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {\n    background: ").concat(dt('checkbox.checked.hover.background'), ";\n}\n\n.p-checkbox.p-disabled {\n    opacity: 1;\n}\n\n.p-checkbox.p-disabled .p-checkbox-box {\n    background: ").concat(dt('checkbox.disabled.background'), ";\n    border-color: ").concat(dt('checkbox.checked.disabled.border.color'), ";\n}\n\n.p-checkbox.p-disabled .p-checkbox-box .p-checkbox-icon {\n    color: ").concat(dt('checkbox.icon.disabled.color'), ";\n}\n");
};
var classes$2 = {
  root: function root(_ref2) {
    var instance = _ref2.instance,
      props = _ref2.props;
    return ['p-checkbox p-component', {
      'p-checkbox-checked': instance.checked,
      'p-disabled': props.disabled,
      'p-invalid': props.invalid,
      'p-variant-filled': props.variant ? props.variant === 'filled' : instance.$primevue.config.inputStyle === 'filled' || instance.$primevue.config.inputVariant === 'filled'
    }];
  },
  box: 'p-checkbox-box',
  input: 'p-checkbox-input',
  icon: 'p-checkbox-icon'
};
var CheckboxStyle = BaseStyle.extend({
  name: 'checkbox',
  theme: theme$2,
  classes: classes$2
});

var theme$1 = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-menubar {\n    display: flex;\n    align-items: center;\n    background: ".concat(dt('menubar.background'), ";\n    border: 1px solid ").concat(dt('menubar.border.color'), ";\n    border-radius: ").concat(dt('menubar.border.radius'), ";\n    color: ").concat(dt('menubar.color'), ";\n    padding: ").concat(dt('menubar.padding'), ";\n    gap: ").concat(dt('menubar.gap'), ";\n}\n\n.p-menubar-start,\n.p-megamenu-end {\n    display: flex;\n    align-items: center;\n}\n\n.p-menubar-root-list,\n.p-menubar-submenu {\n    display: flex;\n    margin: 0;\n    padding: 0;\n    list-style: none;\n    outline: 0 none;\n}\n\n.p-menubar-root-list {\n    align-items: center;\n    flex-wrap: wrap;\n    gap: ").concat(dt('menubar.gap'), ";\n}\n\n.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content {\n    border-radius: ").concat(dt('menubar.base.item.border.radius'), ";\n}\n\n.p-menubar-root-list > .p-menubar-item > .p-menubar-item-content > .p-menubar-item-link {\n    padding: ").concat(dt('menubar.base.item.padding'), ";\n}\n\n.p-menubar-item-content {\n    transition: background ").concat(dt('menubar.transition.duration'), ", color ").concat(dt('menubar.transition.duration'), ";\n    border-radius: ").concat(dt('menubar.item.border.radius'), ";\n    color: ").concat(dt('menubar.item.color'), ";\n}\n\n.p-menubar-item-link {\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    text-decoration: none;\n    overflow: hidden;\n    position: relative;\n    color: inherit;\n    padding: ").concat(dt('menubar.item.padding'), ";\n    gap: ").concat(dt('menubar.item.gap'), ";\n    user-select: none;\n    outline: 0 none;\n}\n\n.p-menubar-item-label {\n    line-height: 1;\n}\n\n.p-menubar-item-icon {\n    color: ").concat(dt('menubar.item.icon.color'), ";\n}\n\n.p-menubar-submenu-icon {\n    color: ").concat(dt('menubar.submenu.icon.color'), ";\n    margin-left: auto;\n    font-size: ").concat(dt('menubar.submenu.icon.size'), ";\n    width: ").concat(dt('menubar.submenu.icon.size'), ";\n    height: ").concat(dt('menubar.submenu.icon.size'), ";\n}\n\n.p-menubar-item.p-focus > .p-menubar-item-content {\n    color: ").concat(dt('menubar.item.focus.color'), ";\n    background: ").concat(dt('menubar.item.focus.background'), ";\n}\n\n.p-menubar-item.p-focus > .p-menubar-item-content .p-menubar-item-icon {\n    color: ").concat(dt('menubar.item.icon.focus.color'), ";\n}\n\n.p-menubar-item.p-focus > .p-menubar-item-content .p-menubar-submenu-icon {\n    color: ").concat(dt('menubar.submenu.icon.focus.color'), ";\n}\n\n.p-menubar-item:not(.p-disabled) > .p-menubar-item-content:hover {\n    color: ").concat(dt('menubar.item.focus.color'), ";\n    background: ").concat(dt('menubar.item.focus.background'), ";\n}\n\n.p-menubar-item:not(.p-disabled) > .p-menubar-item-content:hover .p-menubar-item-icon {\n    color: ").concat(dt('menubar.item.icon.focus.color'), ";\n}\n\n.p-menubar-item:not(.p-disabled) > .p-menubar-item-content:hover .p-menubar-submenu-icon {\n    color: ").concat(dt('menubar.submenu.icon.focus.color'), ";\n}\n\n.p-menubar-item-active > .p-menubar-item-content {\n    color: ").concat(dt('menubar.item.active.color'), ";\n    background: ").concat(dt('menubar.item.active.background'), ";\n}\n\n.p-menubar-item-active > .p-menubar-item-content .p-menubar-item-icon {\n    color: ").concat(dt('menubar.item.icon.active.color'), ";\n}\n\n.p-menubar-item-active > .p-menubar-item-content .p-menubar-submenu-icon {\n    color: ").concat(dt('menubar.submenu.icon.active.color'), ";\n}\n\n.p-menubar-submenu {\n    display: none;\n    position: absolute;\n    min-width: 12.5rem;\n    z-index: 1;\n    background: ").concat(dt('menubar.submenu.background'), ";\n    border: 1px solid ").concat(dt('menubar.submenu.border.color'), ";\n    border-radius: ").concat(dt('menubar.border.radius'), ";\n    box-shadow: ").concat(dt('menubar.submenu.shadow'), ";\n    color: ").concat(dt('menubar.submenu.color'), ";\n    flex-direction: column;\n    padding: ").concat(dt('menubar.submenu.padding'), ";\n    gap: ").concat(dt('menubar.submenu.gap'), ";\n}\n\n.p-menubar-submenu .p-menubar-separator {\n    border-top: 1px solid ").concat(dt('menubar.separator.border.color'), ";\n}\n\n.p-menubar-submenu .p-menubar-item {\n    position: relative;\n}\n\n .p-menubar-submenu > .p-menubar-item-active > .p-menubar-submenu {\n    display: block;\n    left: 100%;\n    top: 0;\n}\n\n.p-menubar-end {\n    margin-left: auto;\n    align-self: center;\n}\n\n.p-menubar-button {\n    display: none;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    width: ").concat(dt('menubar.mobile.button.size'), ";\n    height: ").concat(dt('menubar.mobile.button.size'), ";\n    position: relative;\n    color: ").concat(dt('menubar.mobile.button.color'), ";\n    border: 0 none;\n    background: transparent;\n    border-radius: ").concat(dt('menubar.mobile.button.border.radius'), ";\n    transition: background ").concat(dt('menubar.transition.duration'), ", color ").concat(dt('menubar.transition.duration'), ", outline-color ").concat(dt('menubar.transition.duration'), ";\n    outline-color: transparent;\n}\n\n.p-menubar-button:hover {\n    color: ").concat(dt('menubar.mobile.button.hover.color'), ";\n    background: ").concat(dt('menubar.mobile.button.hover.background'), ";\n}\n\n.p-menubar-button:focus-visible {\n    box-shadow: ").concat(dt('menubar.mobile.button.focus.ring.shadow'), ";\n    outline: ").concat(dt('menubar.mobile.button.focus.ring.width'), " ").concat(dt('menubar.mobile.button.focus.ring.style'), " ").concat(dt('menubar.mobile.button.focus.ring.color'), ";\n    outline-offset: ").concat(dt('menubar.mobile.button.focus.ring.offset'), ";\n}\n\n.p-menubar-mobile {\n    position: relative;\n}\n\n.p-menubar-mobile .p-menubar-button {\n    display: flex;\n}\n\n.p-menubar-mobile .p-menubar-root-list {\n    position: absolute;\n    display: none;\n    width: 100%;\n    padding: ").concat(dt('menubar.submenu.padding'), ";\n    background: ").concat(dt('menubar.submenu.background'), ";\n    border: 1px solid ").concat(dt('menubar.submenu.border.color'), ";\n    box-shadow: ").concat(dt('menubar.submenu.shadow'), ";\n}\n\n.p-menubar-mobile .p-menubar-root-list > .p-menubar-item > .p-menubar-item-content {\n    border-radius: ").concat(dt('menubar.item.border.radius'), ";\n}\n\n.p-menubar-mobile .p-menubar-root-list > .p-menubar-item > .p-menubar-item-content > .p-menubar-item-link {\n    padding: ").concat(dt('menubar.item.padding'), ";\n}\n\n.p-menubar-mobile-active .p-menubar-root-list {\n    display: flex;\n    flex-direction: column;\n    top: 100%;\n    left: 0;\n    z-index: 1;\n}\n\n.p-menubar-mobile .p-menubar-root-list .p-menubar-item {\n    width: 100%;\n    position: static;\n}\n\n.p-menubar-mobile .p-menubar-root-list .p-menubar-separator {\n    border-top: 1px solid ").concat(dt('menubar.separator.border.color'), ";\n}\n\n.p-menubar-mobile .p-menubar-root-list > .p-menubar-item > .p-menubar-item-content .p-menubar-submenu-icon {\n    margin-left: auto;\n    transition: transform 0.2s;\n}\n\n.p-menubar-mobile .p-menubar-root-list > .p-menubar-item-active > .p-menubar-item-content .p-menubar-submenu-icon {\n    transform: rotate(-180deg);\n}\n\n.p-menubar-mobile .p-menubar-submenu .p-menubar-submenu-icon {\n    transition: transform 0.2s;\n    transform: rotate(90deg);\n}\n\n.p-menubar-mobile  .p-menubar-item-active > .p-menubar-item-content .p-menubar-submenu-icon {\n    transform: rotate(-90deg);\n}\n\n.p-menubar-mobile .p-menubar-submenu {\n    width: 100%;\n    position: static;\n    box-shadow: none;\n    border: 0 none;\n    padding-left: ").concat(dt('menubar.submenu.mobile.indent'), ";\n}\n");
};
var inlineStyles = {
  submenu: function submenu(_ref2) {
    var instance = _ref2.instance,
      processedItem = _ref2.processedItem;
    return {
      display: instance.isItemActive(processedItem) ? 'flex' : 'none'
    };
  }
};
var classes$1 = {
  root: function root(_ref3) {
    var instance = _ref3.instance;
    return ['p-menubar p-component', {
      'p-menubar-mobile': instance.queryMatches,
      'p-menubar-mobile-active': instance.mobileActive
    }];
  },
  start: 'p-menubar-start',
  button: 'p-menubar-button',
  rootList: 'p-menubar-root-list',
  item: function item(_ref4) {
    var instance = _ref4.instance,
      processedItem = _ref4.processedItem;
    return ['p-menubar-item', {
      'p-menubar-item-active': instance.isItemActive(processedItem),
      'p-focus': instance.isItemFocused(processedItem),
      'p-disabled': instance.isItemDisabled(processedItem)
    }];
  },
  itemContent: 'p-menubar-item-content',
  itemLink: 'p-menubar-item-link',
  itemIcon: 'p-menubar-item-icon',
  itemLabel: 'p-menubar-item-label',
  submenuIcon: 'p-menubar-submenu-icon',
  submenu: 'p-menubar-submenu',
  separator: 'p-menubar-separator',
  end: 'p-menubar-end'
};
var MenubarStyle = BaseStyle.extend({
  name: 'menubar',
  theme: theme$1,
  classes: classes$1,
  inlineStyles: inlineStyles
});

var theme = function theme(_ref) {
  var dt = _ref.dt;
  return "\n.p-ink {\n    display: block;\n    position: absolute;\n    background: ".concat(dt('ripple.background'), ";\n    border-radius: 100%;\n    transform: scale(0);\n    pointer-events: none;\n}\n\n.p-ink-active {\n    animation: ripple 0.4s linear;\n}\n\n@keyframes ripple {\n    100% {\n        opacity: 0;\n        transform: scale(2.5);\n    }\n}\n");
};
var classes = {
  root: 'p-ink'
};
var RippleStyle = BaseStyle.extend({
  name: 'ripple-directive',
  theme: theme,
  classes: classes
});

const runtimeConfig = useRuntimeConfig();
const config = runtimeConfig?.public?.primevue ?? {};
const { options = {} } = config;

const stylesToTop = [].join('');
const styleProps = {
  
};
const styles = [
  ,
  BaseStyle && BaseStyle.getStyleSheet ? BaseStyle.getStyleSheet(undefined, styleProps) : '',AvatarStyle && AvatarStyle.getStyleSheet ? AvatarStyle.getStyleSheet(undefined, styleProps) : '',TextareaStyle && TextareaStyle.getStyleSheet ? TextareaStyle.getStyleSheet(undefined, styleProps) : '',InputNumberStyle && InputNumberStyle.getStyleSheet ? InputNumberStyle.getStyleSheet(undefined, styleProps) : '',ButtonStyle && ButtonStyle.getStyleSheet ? ButtonStyle.getStyleSheet(undefined, styleProps) : '',DrawerStyle && DrawerStyle.getStyleSheet ? DrawerStyle.getStyleSheet(undefined, styleProps) : '',ToolbarStyle && ToolbarStyle.getStyleSheet ? ToolbarStyle.getStyleSheet(undefined, styleProps) : '',DividerStyle && DividerStyle.getStyleSheet ? DividerStyle.getStyleSheet(undefined, styleProps) : '',AutoCompleteStyle && AutoCompleteStyle.getStyleSheet ? AutoCompleteStyle.getStyleSheet(undefined, styleProps) : '',ProgressBarStyle && ProgressBarStyle.getStyleSheet ? ProgressBarStyle.getStyleSheet(undefined, styleProps) : '',TagStyle && TagStyle.getStyleSheet ? TagStyle.getStyleSheet(undefined, styleProps) : '',InputIconStyle && InputIconStyle.getStyleSheet ? InputIconStyle.getStyleSheet(undefined, styleProps) : '',InputTextStyle && InputTextStyle.getStyleSheet ? InputTextStyle.getStyleSheet(undefined, styleProps) : '',IconFieldStyle && IconFieldStyle.getStyleSheet ? IconFieldStyle.getStyleSheet(undefined, styleProps) : '',ColumnStyle && ColumnStyle.getStyleSheet ? ColumnStyle.getStyleSheet(undefined, styleProps) : '',DataTableStyle && DataTableStyle.getStyleSheet ? DataTableStyle.getStyleSheet(undefined, styleProps) : '',DialogStyle && DialogStyle.getStyleSheet ? DialogStyle.getStyleSheet(undefined, styleProps) : '',CardStyle && CardStyle.getStyleSheet ? CardStyle.getStyleSheet(undefined, styleProps) : '',ToastStyle && ToastStyle.getStyleSheet ? ToastStyle.getStyleSheet(undefined, styleProps) : '',ConfirmDialogStyle && ConfirmDialogStyle.getStyleSheet ? ConfirmDialogStyle.getStyleSheet(undefined, styleProps) : '',CheckboxStyle && CheckboxStyle.getStyleSheet ? CheckboxStyle.getStyleSheet(undefined, styleProps) : '',MenubarStyle && MenubarStyle.getStyleSheet ? MenubarStyle.getStyleSheet(undefined, styleProps) : '',RippleStyle && RippleStyle.getStyleSheet ? RippleStyle.getStyleSheet(undefined, styleProps) : ''
].join('');

Theme.setTheme(options?.theme);

const themes = [
    BaseStyle && BaseStyle.getCommonThemeStyleSheet ? BaseStyle.getCommonThemeStyleSheet(undefined, styleProps) : '',
    BaseStyle && BaseStyle.getThemeStyleSheet ? BaseStyle.getThemeStyleSheet(undefined, styleProps) : '',AvatarStyle && AvatarStyle.getThemeStyleSheet ? AvatarStyle.getThemeStyleSheet(undefined, styleProps) : '',TextareaStyle && TextareaStyle.getThemeStyleSheet ? TextareaStyle.getThemeStyleSheet(undefined, styleProps) : '',InputNumberStyle && InputNumberStyle.getThemeStyleSheet ? InputNumberStyle.getThemeStyleSheet(undefined, styleProps) : '',ButtonStyle && ButtonStyle.getThemeStyleSheet ? ButtonStyle.getThemeStyleSheet(undefined, styleProps) : '',DrawerStyle && DrawerStyle.getThemeStyleSheet ? DrawerStyle.getThemeStyleSheet(undefined, styleProps) : '',ToolbarStyle && ToolbarStyle.getThemeStyleSheet ? ToolbarStyle.getThemeStyleSheet(undefined, styleProps) : '',DividerStyle && DividerStyle.getThemeStyleSheet ? DividerStyle.getThemeStyleSheet(undefined, styleProps) : '',AutoCompleteStyle && AutoCompleteStyle.getThemeStyleSheet ? AutoCompleteStyle.getThemeStyleSheet(undefined, styleProps) : '',ProgressBarStyle && ProgressBarStyle.getThemeStyleSheet ? ProgressBarStyle.getThemeStyleSheet(undefined, styleProps) : '',TagStyle && TagStyle.getThemeStyleSheet ? TagStyle.getThemeStyleSheet(undefined, styleProps) : '',InputIconStyle && InputIconStyle.getThemeStyleSheet ? InputIconStyle.getThemeStyleSheet(undefined, styleProps) : '',InputTextStyle && InputTextStyle.getThemeStyleSheet ? InputTextStyle.getThemeStyleSheet(undefined, styleProps) : '',IconFieldStyle && IconFieldStyle.getThemeStyleSheet ? IconFieldStyle.getThemeStyleSheet(undefined, styleProps) : '',ColumnStyle && ColumnStyle.getThemeStyleSheet ? ColumnStyle.getThemeStyleSheet(undefined, styleProps) : '',DataTableStyle && DataTableStyle.getThemeStyleSheet ? DataTableStyle.getThemeStyleSheet(undefined, styleProps) : '',DialogStyle && DialogStyle.getThemeStyleSheet ? DialogStyle.getThemeStyleSheet(undefined, styleProps) : '',CardStyle && CardStyle.getThemeStyleSheet ? CardStyle.getThemeStyleSheet(undefined, styleProps) : '',ToastStyle && ToastStyle.getThemeStyleSheet ? ToastStyle.getThemeStyleSheet(undefined, styleProps) : '',ConfirmDialogStyle && ConfirmDialogStyle.getThemeStyleSheet ? ConfirmDialogStyle.getThemeStyleSheet(undefined, styleProps) : '',CheckboxStyle && CheckboxStyle.getThemeStyleSheet ? CheckboxStyle.getThemeStyleSheet(undefined, styleProps) : '',MenubarStyle && MenubarStyle.getThemeStyleSheet ? MenubarStyle.getThemeStyleSheet(undefined, styleProps) : '',RippleStyle && RippleStyle.getThemeStyleSheet ? RippleStyle.getThemeStyleSheet(undefined, styleProps) : ''
].join('');

const defineNitroPlugin = (def) => def;
const _D4WymrJUtu = defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    html.head.unshift(stylesToTop);
    html.head.push(styles);
    html.head.push(themes);
  });
});

const plugins = [
  _D4WymrJUtu
];

const errorHandler = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.path,
    statusCode,
    statusMessage,
    message,
    stack: "",
    // TODO: check and validate error.data for serialisation into query
    data: error.data
  };
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (event.handled) {
    return;
  }
  setResponseStatus(event, errorObject.statusCode !== 200 && errorObject.statusCode || 500, errorObject.statusMessage);
  if (isJsonRequest(event)) {
    setResponseHeader(event, "Content-Type", "application/json");
    return send(event, JSON.stringify(errorObject));
  }
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (!res) {
    const { template } = await import('./_/error-500.mjs');
    if (event.handled) {
      return;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  if (event.handled) {
    return;
  }
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : void 0, res.statusText);
  return send(event, html);
});

const assets = {
  "/android-chrome-192x192.png": {
    "type": "image/png",
    "etag": "\"953d-FiY760LJNQFWMDnCEQLS5GTFFXI\"",
    "mtime": "2025-01-13T09:31:54.898Z",
    "size": 38205,
    "path": "../public/android-chrome-192x192.png"
  },
  "/android-chrome-192x192.pngZone.Identifier": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
    "mtime": "2025-01-13T09:31:54.898Z",
    "size": 0,
    "path": "../public/android-chrome-192x192.pngZone.Identifier"
  },
  "/android-chrome-512x512.png": {
    "type": "image/png",
    "etag": "\"30074-7RSQ1Q0kAm2qpTmP46lguBO3yA8\"",
    "mtime": "2025-01-13T09:31:54.900Z",
    "size": 196724,
    "path": "../public/android-chrome-512x512.png"
  },
  "/android-chrome-512x512.pngZone.Identifier": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
    "mtime": "2025-01-13T09:31:54.900Z",
    "size": 0,
    "path": "../public/android-chrome-512x512.pngZone.Identifier"
  },
  "/apple-touch-icon.png": {
    "type": "image/png",
    "etag": "\"861d-EXlB33dsIYW5wtLUgq8Rx/dStis\"",
    "mtime": "2025-01-13T09:31:54.901Z",
    "size": 34333,
    "path": "../public/apple-touch-icon.png"
  },
  "/apple-touch-icon.pngZone.Identifier": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
    "mtime": "2025-01-13T09:31:54.901Z",
    "size": 0,
    "path": "../public/apple-touch-icon.pngZone.Identifier"
  },
  "/favicon-16x16.png": {
    "type": "image/png",
    "etag": "\"33f-55POB7nHjQpV+ft/1QEoIa01HNg\"",
    "mtime": "2025-01-13T09:31:54.902Z",
    "size": 831,
    "path": "../public/favicon-16x16.png"
  },
  "/favicon-16x16.pngZone.Identifier": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
    "mtime": "2025-01-13T09:31:54.902Z",
    "size": 0,
    "path": "../public/favicon-16x16.pngZone.Identifier"
  },
  "/favicon-32x32.png": {
    "type": "image/png",
    "etag": "\"898-be5iC+sHtwMV8IHD0lzqvkaI1rg\"",
    "mtime": "2025-01-13T09:31:54.902Z",
    "size": 2200,
    "path": "../public/favicon-32x32.png"
  },
  "/favicon-32x32.pngZone.Identifier": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
    "mtime": "2025-01-13T09:31:54.902Z",
    "size": 0,
    "path": "../public/favicon-32x32.pngZone.Identifier"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"3c2e-e5VNY4iJcxWoD5A5UJHjlevmrdo\"",
    "mtime": "2025-01-13T09:31:54.903Z",
    "size": 15406,
    "path": "../public/favicon.ico"
  },
  "/favicon.icoZone.Identifier": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
    "mtime": "2025-01-13T09:31:54.903Z",
    "size": 0,
    "path": "../public/favicon.icoZone.Identifier"
  },
  "/site.webmanifest": {
    "type": "application/manifest+json",
    "etag": "\"107-vzG6+RvdL83iSkXj8qG+M3M8b2k\"",
    "mtime": "2025-01-13T09:31:54.904Z",
    "size": 263,
    "path": "../public/site.webmanifest"
  },
  "/site.webmanifestZone.Identifier": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
    "mtime": "2025-01-13T09:31:54.905Z",
    "size": 0,
    "path": "../public/site.webmanifestZone.Identifier"
  },
  "/_nuxt/07z1eGyU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8fd-NW6TWLZR9ilnLL+n/jtk+kgtfB4\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 2301,
    "path": "../public/_nuxt/07z1eGyU.js"
  },
  "/_nuxt/BacDmIco.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"113-O9vJxpLOKeG59DHAXqkeWgY6Jso\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 275,
    "path": "../public/_nuxt/BacDmIco.js"
  },
  "/_nuxt/BE-9Af6F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"531-57xnqP923qPa6FeUAYoxfctePDg\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 1329,
    "path": "../public/_nuxt/BE-9Af6F.js"
  },
  "/_nuxt/BI8X3djV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5c-UALxdstAHdf+aIQ7TzWCwXwqcpw\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 92,
    "path": "../public/_nuxt/BI8X3djV.js"
  },
  "/_nuxt/BM4Oq2ZP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8b88-qMLWrs6xYsSCu9Iqko77tTVvQ0U\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 35720,
    "path": "../public/_nuxt/BM4Oq2ZP.js"
  },
  "/_nuxt/BRx_TZRX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12f-W16N6rrmWF3GA3ROG/pG6lyd2VU\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 303,
    "path": "../public/_nuxt/BRx_TZRX.js"
  },
  "/_nuxt/BS_8Blfk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8760-Ud2Hl3ZiDj7Ba4Nt3o5tKBSZjxg\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 34656,
    "path": "../public/_nuxt/BS_8Blfk.js"
  },
  "/_nuxt/CBRWFSoc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"460-ActRbXjISpOL9blG/zR1uU4EHLU\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 1120,
    "path": "../public/_nuxt/CBRWFSoc.js"
  },
  "/_nuxt/CFvPMSyN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d93e3-yT0rJWOZLkrQYIm8A/0fpGMlfsc\"",
    "mtime": "2025-01-14T04:06:28.813Z",
    "size": 889827,
    "path": "../public/_nuxt/CFvPMSyN.js"
  },
  "/_nuxt/ChMmYQmW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ba0-Mok5EWKsJDMg67+LTNgLKUoDZI4\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 11168,
    "path": "../public/_nuxt/ChMmYQmW.js"
  },
  "/_nuxt/CNa568vX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ae9-gea5+7L4rZx4n7eOhVqw0LnhTak\"",
    "mtime": "2025-01-14T04:06:28.811Z",
    "size": 2793,
    "path": "../public/_nuxt/CNa568vX.js"
  },
  "/_nuxt/CnBzgn5z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"187-4fSK3rArvCy/yR3bBtPA2ZbfVYA\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 391,
    "path": "../public/_nuxt/CnBzgn5z.js"
  },
  "/_nuxt/Cvb8ZFfh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7c25-Fc70JSk9RzFzD7/nwl9UY2GV9oI\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 31781,
    "path": "../public/_nuxt/Cvb8ZFfh.js"
  },
  "/_nuxt/Cy6_owce.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"21e6-TgjVi2vByiLwVpqz52S90Phuaes\"",
    "mtime": "2025-01-14T04:06:28.813Z",
    "size": 8678,
    "path": "../public/_nuxt/Cy6_owce.js"
  },
  "/_nuxt/DiaEVlFM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"178-LY8WkVHAwjE4KXaPxepNswJV9HY\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 376,
    "path": "../public/_nuxt/DiaEVlFM.js"
  },
  "/_nuxt/DlAUqK2U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5b-eFCz/UrraTh721pgAl0VxBNR1es\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 91,
    "path": "../public/_nuxt/DlAUqK2U.js"
  },
  "/_nuxt/entry.DlwAx4nK.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"6c36-3v/Vvsj1Pj7P+Hu7erpE9ykDX5E\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 27702,
    "path": "../public/_nuxt/entry.DlwAx4nK.css"
  },
  "/_nuxt/error-404.SUfaEU2h.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"de4-O6Er5Vy2hbqIHncLWFAfb8aMHtc\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 3556,
    "path": "../public/_nuxt/error-404.SUfaEU2h.css"
  },
  "/_nuxt/error-500.DpdH80vC.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75c-7qxlAQcQY0KITJ5KN3X7O4kpg1M\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 1884,
    "path": "../public/_nuxt/error-500.DpdH80vC.css"
  },
  "/_nuxt/primeicons.CI7iEhau.eot": {
    "type": "application/vnd.ms-fontobject",
    "etag": "\"10504-zPZeQGgLDt5qtGk51CHIMa5q/PQ\"",
    "mtime": "2025-01-14T04:06:28.808Z",
    "size": 66820,
    "path": "../public/_nuxt/primeicons.CI7iEhau.eot"
  },
  "/_nuxt/primeicons.CPxenFJM.svg": {
    "type": "image/svg+xml",
    "etag": "\"42564-Yhd1suxVX9LdFSokOQz23+7haLE\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 271716,
    "path": "../public/_nuxt/primeicons.CPxenFJM.svg"
  },
  "/_nuxt/primeicons.cX8YLkvA.woff": {
    "type": "font/woff",
    "etag": "\"104a0-IeR36hnhW2Y0S8wjs/uyFhCSpwc\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 66720,
    "path": "../public/_nuxt/primeicons.cX8YLkvA.woff"
  },
  "/_nuxt/primeicons.DvHBoTlB.ttf": {
    "type": "font/ttf",
    "etag": "\"10454-5shsqQqftCgvs1Uj1W/eAOeKFBY\"",
    "mtime": "2025-01-14T04:06:28.810Z",
    "size": 66644,
    "path": "../public/_nuxt/primeicons.DvHBoTlB.ttf"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-8cAJj2LKVMMzzE/fUwcohCpbfrc\"",
    "mtime": "2025-01-14T04:06:28.946Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/images/logos/pocketnuxt.svg": {
    "type": "image/svg+xml",
    "etag": "\"1c98-v5ObM88dQA/iZrJvbEWRBHVDQ9s\"",
    "mtime": "2025-01-13T09:31:54.904Z",
    "size": 7320,
    "path": "../public/images/logos/pocketnuxt.svg"
  },
  "/_nuxt/builds/meta/0343c794-3ee3-4506-a33b-b668bac3e909.json": {
    "type": "application/json",
    "etag": "\"8b-f3JaBndJoLCreEzlpoHjQqEGFos\"",
    "mtime": "2025-01-14T04:06:28.947Z",
    "size": 139,
    "path": "../public/_nuxt/builds/meta/0343c794-3ee3-4506-a33b-b668bac3e909.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises$1.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _f4b49z = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    setResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _lazy_aB9XZ9 = () => import('./routes/api/affSearch.mjs');
const _lazy_rLYC9S = () => import('./routes/api/auth/checkLogin.mjs');
const _lazy_JjPWHl = () => import('./routes/api/auth/login.mjs');
const _lazy_ClON6e = () => import('./routes/api/getAffiliateUserInfo.post.mjs');
const _lazy_CYo2HL = () => import('./routes/api/getEndPage.mjs');
const _lazy_BIq4AZ = () => import('./routes/api/getPopup.mjs');
const _lazy_A2URw4 = () => import('./routes/api/google-suggest.mjs');
const _lazy_pjZKeR = () => import('./routes/api/parse-url.post.mjs');
const _lazy_lRmY5T = () => import('./routes/api/product-info/_itemId_.mjs');
const _lazy_pKOGo6 = () => import('./routes/api/saveProduct.post.mjs');
const _lazy_yZ8QHi = () => import('./routes/api/suggest.mjs');
const _lazy_1p1sLb = () => import('./routes/renderer.mjs');

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '/api/affSearch', handler: _lazy_aB9XZ9, lazy: true, middleware: false, method: undefined },
  { route: '/api/auth/checkLogin', handler: _lazy_rLYC9S, lazy: true, middleware: false, method: undefined },
  { route: '/api/auth/login', handler: _lazy_JjPWHl, lazy: true, middleware: false, method: undefined },
  { route: '/api/getAffiliateUserInfo', handler: _lazy_ClON6e, lazy: true, middleware: false, method: "post" },
  { route: '/api/getEndPage', handler: _lazy_CYo2HL, lazy: true, middleware: false, method: undefined },
  { route: '/api/getPopup', handler: _lazy_BIq4AZ, lazy: true, middleware: false, method: undefined },
  { route: '/api/google-suggest', handler: _lazy_A2URw4, lazy: true, middleware: false, method: undefined },
  { route: '/api/parse-url', handler: _lazy_pjZKeR, lazy: true, middleware: false, method: "post" },
  { route: '/api/product-info/:itemId', handler: _lazy_lRmY5T, lazy: true, middleware: false, method: undefined },
  { route: '/api/saveProduct', handler: _lazy_pKOGo6, lazy: true, middleware: false, method: "post" },
  { route: '/api/suggest', handler: _lazy_yZ8QHi, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_1p1sLb, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_1p1sLb, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((_err) => {
      console.error("Error while capturing another error", _err);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      await nitroApp.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const localCall = createCall(toNodeListener(h3App));
  const _localFetch = createFetch(localCall, globalThis.fetch);
  const localFetch = (input, init) => _localFetch(input, init).then(
    (response) => normalizeFetchResponse(response)
  );
  const $fetch = createFetch$1({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  h3App.use(
    eventHandler((event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const envContext = event.node.req?.__unenv__;
      if (envContext) {
        Object.assign(event.context, envContext);
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (envContext?.waitUntil) {
          envContext.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
    })
  );
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  for (const plugin of plugins) {
    try {
      plugin(app);
    } catch (err) {
      captureError(err, { tags: ["plugin"] });
      throw err;
    }
  }
  return app;
}
const nitroApp = createNitroApp();
const useNitroApp = () => nitroApp;

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((err) => {
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        destroy(socket);
      }
    }
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        destroy(socket);
      }
    }
  }
  server.on("request", function(req, res) {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", function() {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", function(socket) {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", function() {
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    if (options.development) {
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        return Promise.resolve(false);
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((err) => {
      const errString = typeof err === "string" ? err : JSON.stringify(err);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT, 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((err) => {
          console.error(err);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, toNodeListener(nitroApp.h3App)) : new Server$1(toNodeListener(nitroApp.h3App));
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const path = process.env.NITRO_UNIX_SOCKET;
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const addressInfo = listener.address();
  if (typeof addressInfo === "string") {
    console.log(`Listening on unix socket ${addressInfo}`);
    return;
  }
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${addressInfo.family === "IPv6" ? `[${addressInfo.address}]` : addressInfo.address}:${addressInfo.port}${baseURL}`;
  console.log(`Listening on ${url}`);
});
trapUnhandledNodeErrors();
setupGracefulShutdown(listener, nitroApp);
const nodeServer = {};

export { send as a, getResponseStatus as b, setResponseStatus as c, defineEventHandler as d, eventHandler as e, useNitroApp as f, getQuery as g, setResponseHeaders as h, createError$1 as i, joinRelativeURL as j, getRouteRules as k, getResponseStatusText as l, nodeServer as n, readBody as r, setResponseHeader as s, useRuntimeConfig as u };
//# sourceMappingURL=runtime.mjs.map
