import { d as defineEventHandler, r as readBody } from '../../../runtime.mjs';
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

const _itemId_ = defineEventHandler(async (event) => {
  const itemId = parseInt(event.context.params.itemId);
  const body = await readBody(event);
  const cookies = body.cookies;
  try {
    const res = await axios.get(`https://affiliate.shopee.co.id/api/v3/offer/product?item_id=${itemId}`, {
      // params: {
      //   'list_type': '0',
      //   'keyword': kw,
      //   'sort_type': '1',
      //   'page_offset': currentOffset,
      //   'page_limit': pageLimit,
      //   'client_type': '1'
      // },
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        "affiliate-program-type": "1",
        "cookie": cookies,
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
    return res.data;
  } catch (error) {
    return error;
  }
});

export { _itemId_ as default };
//# sourceMappingURL=_itemId_.mjs.map
