import { d as defineEventHandler, r as readBody } from '../../runtime.mjs';
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

const affSearch = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const cookie = body.cookies;
  const kw = body.kw;
  console.log(kw);
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/plain, */*");
  myHeaders.append("accept-language", "en-US,en;q=0.9,id;q=0.8,ru;q=0.7");
  myHeaders.append("affiliate-program-type", "1");
  myHeaders.append("cookie", cookie);
  myHeaders.append("priority", "u=1, i");
  myHeaders.append("referer", "https://affiliate.shopee.co.id/offer/product_offer");
  myHeaders.append("sec-ch-ua", '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"');
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append("sec-ch-ua-platform", '"Windows"');
  myHeaders.append("sec-fetch-dest", "empty");
  myHeaders.append("sec-fetch-mode", "cors");
  myHeaders.append("sec-fetch-site", "same-origin");
  myHeaders.append("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36");
  myHeaders.append("x-sz-sdk-version", "1.10.15");
  console.log(kw);
  const ember = [];
  let limit = 100;
  let currentOffset = 0;
  let pageLimit = 50;
  try {
    while (currentOffset < limit) {
      console.log(`Fetch ${currentOffset}`);
      const res = await axios.get("https://affiliate.shopee.co.id/api/v3/offer/product/list", {
        params: {
          "list_type": "0",
          "keyword": kw,
          "sort_type": "1",
          "page_offset": currentOffset,
          "page_limit": pageLimit,
          "client_type": "1"
        },
        headers: {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9,id;q=0.8",
          "affiliate-program-type": "1",
          "cookie": cookie,
          "csrf-token": "KDYt9MTJ-raRXpqekJoEl5TCkXOoAJJi0Dyc",
          "priority": "u=1, i",
          "referer": "https://affiliate.shopee.co.id/dashboard",
          "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent": "iPhone; iOS 14.4.2; Scale/3.00"
        }
      });
      limit = res.data.data.total_count;
      currentOffset = currentOffset + 50;
      for (let index = 0; index < res.data.data.list.length; index++) {
        const element = res.data.data.list[index];
        ember.push(element);
      }
    }
    return ember;
  } catch (error) {
    return error;
  }
  return ember;
});

export { affSearch as default };
//# sourceMappingURL=affSearch.mjs.map
