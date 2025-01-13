import { d as defineEventHandler, r as readBody } from '../../../runtime.mjs';
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
  parseInt(event.context.params.itemId);
  const body = await readBody(event);
  const cookies = body.cookies;
  try {
    const res = await fetch("https://mall.shopee.co.id/api/v4/pdp/get?_pft=255&ads_id=341798776&from_source=mini_feed&image_ids=id-11134201-23030-t37ll2fa6nova1&item_id=19876087620&pdp_type=0&shop_id=852482318&tz_offset_minutes=420", {
      headers: {
        "Host": "mall.shopee.co.id",
        "Cookie": cookies,
        // 'af-ac-enc-sz-token': 'Do5MtRu1qXOtlx+v45d7kw==|szvGgGp2+GA3BXOAxRL+tMCsPqUO9Kf33SUrzqL0VfMEZNE1RxTngd2Duf7BU00HflXg9qB7qFCD+rysUhJJCg==|MsCrBkvAHDDcji6f|08|2',
        // 'if-none-match-': '55b03-c326977bbf999257b3394024bc3e87c5',
        "x-api-source": "rn",
        "af-ac-cli-id": "68f27089dcf78bff6039f21b8ab9ae8f",
        // '3384fa59': 'zM9Or1AyIjHjd4bhrdUg4IhCxRQKEHj4SXW84rl7SuFkCrjId8xPoN7rehavzK4NPEzXjSi4FXHSz/9eViRPW/aPwYQZDH5KS5KYF1NY6ZBz4uDRqBjmowpC3HyYnzM5V/6qHnr+K0jZn5c23e4A6FaRbsLgSis3I+ujHwaYyzihw5ROKHJ842mz1gKJ4k+AugxWINtYnKE6Cpw+xwPrOzg+YxjhRqivA/zTlv0y089hJRCIev6EO767ka7vfPCUNUaiZ7R3n1dsmSL00u6cxaQp7N+8SCr3IbZ6takcA3msaKBnVJEkFJzvaqdSPl9j+G47m4uF5PetKZPpf+oLjututWWi9o5ZS3F0GBMSjubTm1er3TnCALjmmo35c5CUBWnbcDer5vyg4T81uSzPgCW6OlpEWEfcEyEm9rtoSATPgDzNF6JNxNVwQTvHimghAo9C8NRDNkXw42hTyJmmaaYI3KKD+vdLfHmrOFN/AfJDk0yQS0z2WfRM075FWtX77BQ497gaDw3JHCUZxuzw7sFxc/7XChzL+gEQgxtLeCi/ybjrzYZfnHO/KxHf++UebYvE88xHvZpxuPrQPO7xpoCPKQ2WCdzRXtHIlpAHZl9FQFkAsjOYXfZW8FUWocN0yE500PLC9uZEbEMv',
        // '6a71872e': '5AGTqAxAtmJsFBjimDkywKCZL/8=',
        "x-shopee-language": "id",
        // 'client-request-id': 'fd40580f-7136-4907-92b2-c6e0dca9eb5a.839',
        "user-agent": "iOS app iPhone Shopee appver=34152 language=id app_type=1 platform=native_ios os_ver=18.1.1 Cronet/102.0.5005.61",
        // 'a7715e07': 'Kzbp17rpDtpIt9nS/7zzWEiGsKB=',
        "x-shopee-client-timezone": "Asia/Jakarta",
        // 'x-sap-ri': '1df584677ac967fc3d63de27012148ad5b24ff324691bbbb9651',
        "accept": "*/*",
        "referer": "https://mall.shopee.co.id/",
        "accept-language": "id-ID,id,en-US,en"
      }
    });
    return res.data;
  } catch (error) {
    return error;
  }
});

export { _itemId_ as default };
//# sourceMappingURL=_itemId_.mjs.map
