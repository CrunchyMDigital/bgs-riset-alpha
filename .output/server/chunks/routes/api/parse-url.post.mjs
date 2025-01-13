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

const parseUrl_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const cookie = body.cookies;
  const headers = {
    "Host": "live.shopee.co.id",
    "Cookie": cookie,
    "Client-Request-Id": "93047899-b4f7-403a-995b-1cb8e025e023.2321",
    "X-Sap-Access-F": "2.17.5.1|13|3.8.0_64|D277A062139C4DA8B8E1071933F526514CF178A27BFB4B|1900|100",
    "User-Agent": "language=id app_type=1 platform=native_ios appver=33045 os_ver=17.5.1 Cronet/102.0.5005.61",
    "19b8ed10": "eW/JL1UUDEGyOI1paD//ePbOwJJWIUWp5Kot7cYGUQV8IjNN81PU9t9GefX0DTabe/bx2H/uMr2nFfi8CihhAtOLH/8j711LbQayHZLLnIbTlbX1UGczf2Q1sh6rUQOxYwc/V2Lf6PDG0weMZL1b6TNEEH9BM8CEbzRFKirtc1q3/Mezpyf0zCf7rklSBmfP/GEuNygGM3+n9FXxsB+JP8X8VZVMC/mK1+MbLzvz3UlHu3njwmE11xB470HwLILsZXkf8Bk+GRCh3nyQM/FS0fpESf7UnM6zHBAfAgyqR0Pro9L1jtKtV+Ho6xXbndgieUJTDrP0WKebFi8MfM2cd7K98Y6ddb8+qixUBpqjwm/rwYZGoGHgMxlWjZuImrzp7zwoWLUjF3133esLfU8xC4b3MSXWuxdyFRnKeBkpPKPGaNc4AZYdL78wHk5Gmndu1oUNWnyDuSeiekEZ3yGohQWmYRt7Yv10v98NktV7raDNC5WMDk8E4e4mQyyaVuaDAZ/iP0yv6xPkHK40cjedOQECbhamie9zMXRvtlmkaKhl3AYNgGJEvKCyjYBuyvtrUd9tObKB58RL8kcmMbm6T7DRglk7VAanNkwV8Wncxnxh+RrcY7zdg86QGr/Y33BpKJPr+XEXnLm7L8NP",
    "X-Livestreaming-Auth": "ls_ios_v1_20001_1721292912_8B5D93A4D9DF4BA8947303DF3CF62297-1721292912004-210901|HVa9qyTnnF1dvjBKKc3KPQcspGy9jgJATToBvXGyHU8=",
    "X-Ls-Sz-Token": "RMhx3BYGqbUt6Y0084cEvg==|DY0Qoq33WTeSOkVShLaF93nFi0eow7KU2HY2n79q/DLsRORVN08xWerBdJZnVdIuMo7O6FGdkkRrGALlF7laAQ==|DZ2CPWfDTRlNW8yw|08|2",
    "X-Sap-Access-S": "L3xe615JdfglOL_LuV6hA4hInAZx8f3ILLUPBMRCqz0=",
    "X-Livestreaming-Source": "shopee",
    "C6c978f9": "unTeuC6zOS7LONG07OU17IVjkm4=",
    "Af-Ac-Enc-Sz-Token": "RMhx3BYGqbUt6Y0084cEvg==|DY0Qoq33WTeSOkVShLaF93nFi0eow7KU2HY2n79q/DLsRORVN08xWerBdJZnVdIuMo7O6FGdkkRrGALlF7laAQ==|DZ2CPWfDTRlNW8yw|08|2",
    "X-Shopee-Client-Timezone": "Asia/Jakarta",
    "X-Livestreaming-Moderator": moderatorId,
    "862d06c7": "FKop1+wUHEpd0SMeCx7QQp99Z4t=",
    "Client-Info": "device_id=8B5D93A4D9DF4BA8947303DF3CF62297;device_model=iPhone12%2C3;os=1;os_version=17.5.1;client_version=33045;platform=4;app_type=1;language=id",
    "X-Sap-Ri": "70d89866318127b927ea0d280193b3bc0e188c7d8eccaa07cddc",
    "2b402bc9": "jNNDB81NZ9aBdQx7N0BQy/ciO3w=",
    "Af-Ac-Enc-Id": "/51nuSTHU319v0qR7AamX3p8er8uPVd5DDhk6OMW5UxSxjk2uPI63ld4MWBgD8JmAXkGWw==",
    "Content-Type": "application/json",
    "Af-Ac-Enc-Dat": null,
    "X-Sap-Access-T": "1721292912",
    "Accept": "*/*",
    "Accept-Language": "id-ID,id,en-US,en"
  };
  const toInsert = await axios.post("https://live.shopee.co.id/api/v1/item/parse_url", data, { headers }).then((response) => {
    const parsed = response.data;
    const toInsert2 = parsed.data.items.map((item) => ({
      shop_id: item.shop_id,
      item_id: item.item_id
    }));
    return toInsert2;
  }).catch((error) => {
    console.error("Error:", error);
  });
  return toInsert;
});

export { parseUrl_post as default };
//# sourceMappingURL=parse-url.post.mjs.map
