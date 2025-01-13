import { d as defineEventHandler, g as getQuery } from '../../runtime.mjs';
import axios from 'axios';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import '@primevue/core/base/style';
import '@primeuix/utils/object';
import '@primeuix/styled';
import 'node:fs';
import 'node:url';

const googleSuggest = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const kw = query.kw || "baju";
  let suggestions = [];
  try {
    const response = await axios.get("https://suggestqueries.google.com/complete/search", {
      params: {
        client: "firefox",
        q: kw
      }
    });
    suggestions = response.data[1];
  } catch {
    suggestions = [];
  }
  return suggestions;
});

export { googleSuggest as default };
//# sourceMappingURL=google-suggest.mjs.map
