import { d as defineEventHandler, r as readBody } from '../../runtime.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import '@primevue/core/base/style';
import '@primeuix/utils/object';
import '@primeuix/styled';
import 'node:fs';
import 'node:url';

const getAffiliateUserInfo_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const cookie = body.cookies;
  const x = await fetch("https://affiliate.shopee.co.id/api/v3/user/profile", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.8",
      "affiliate-program-type": "1",
      "csrf-token": "DyGB6Za4-ynMsRmHQkLaF98PrXcwBlsGYkbQ",
      "priority": "u=1, i",
      "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Brave";v="128"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "cookie": cookie,
      "Referer": "https://affiliate.shopee.co.id/dashboard",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  }).then(async (res) => await res.json());
  return x;
});

export { getAffiliateUserInfo_post as default };
//# sourceMappingURL=getAffiliateUserInfo.post.mjs.map
