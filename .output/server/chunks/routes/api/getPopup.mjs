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

const getPopup = defineEventHandler(async (event) => {
  const body = await readBody(event);
  body.cookies;
  const paramx = body.params;
  const url = "https://shopee.co.id/api/v4/pdp/get_pc";
  const params = paramx;
  const newParams = `/item_id=${params.itemId}&shop_id=${params.shopId}&tz_offset_minutes=420&detail_level=0&`;
  console.log(url + newParams);
  try {
    const response = await axios.get("https://mall.shopee.co.id/api/v4/pdp/get", {
      params: {
        "_pft": "255",
        "ads_id": "341798776",
        "from_source": "mini_feed",
        "image_ids": "id-11134201-23030-t37ll2fa6nova1",
        "item_id": "19876087620",
        "pdp_type": "0",
        "shop_id": "852482318",
        "tz_offset_minutes": "420"
      },
      headers: {
        "Host": "mall.shopee.co.id",
        "Cookie": "REC_T_ID=bb50c213-d0c1-11ef-b9c1-9e27dc2754ae; shopee_token=EGcdsal6Fl/z21QufDo+sfm4T4qSumatPTjlxvT6wfMLHTwtbJw3aCkYLq3II6z+6xcnc2Cs1Qj/5kojQMCR; shopid=20194681; userid=20196017; username=kopiseduh; SPC_AFTID=LAT; SPC_CLIENTID=OEI1RDkzQTREOURGmnqlahosignqljjn; shopee_app_version=34152; shopee_rn_bundle_version=6042003; shopee_rn_version=1736523267; SPC_F=8B5D93A4D9DF4BA8947303DF3CF62297; SPC_DID=8B5D93A4D9DF4BA8947303DF3CF62297; SPC_RNBV=6042003; language=id; SPC_F=8B5D93A4D9DF4BA8947303DF3CF62297; csrftoken=8vwSduv0lRk8O2uIUBQg1za3jD7Hgizd; SPC_SEC_SI=v1-VFFyM0UyaThvZ2p2SFNrVe3pwIj3fWlq3gfTdWEJTj2aTc5dGIUNx9hA6eBD+HvE3P7JgjAob7/+iCFY+XKZ3JeUKahotHUZLnO9ClKsQ/g=; SPC_DH=ESmvf2yJ/q/pT3SUM8m9eOODoVSzt3pn10JWUDrs85VXVrwUR2NMErJ+tU7/+o6jD7cOA5uaYCxv; SPC_B_SI=Ied8ZwAAAABzTzJtaHc4Rmu+RgAAAAAAVlNwNTlKcno=; SPC_R_T_IV=UnlyS0phZU03M2ZxUjVDbg==; SPC_T_ID=JewcLoTqsYxjwwnTXtsa0GgYs8uYnPnXWqR9s6MMsTzwKdQStuiqxlQgh7yinl6HLaNJ0fYPSwpMu9keNqrVolVRVVFsWOoYz6DdPSdfc2Ysb8fxGIwhhYVXhz03OaN65HhWrpoow19EF2VBJHO1ULMfWcGkNnPH3nJ7ZyTzdes=; SPC_T_IV=UnlyS0phZU03M2ZxUjVDbg==; SPC_SI=lOh8ZwAAAABzaENyQ3ozQmtJOQAAAAAAZjN5UGNoYng=; SPC_ST=.bjhHRTl0NU9wbjZIdDJoYT+HQlfN10iARDIYjF3JAJeXZ4RyVs+N+YJW8v1ielnLCSXRWyxp1BlLixJM0FpIZ/rb3K/Q5XLheO+LDFwLHgfo//BhpuDIGbZLYNm77t8V3r5YTeIv3C2128+toTCbDS55R3oQToOaowLaoIVxCH21tTg4pbOAwqJ4sETvy/UuV7rIjmz95b1d5ayEqiN9UXwFhADOxhag3LDXqVmBq9s=; SPC_U=20196017; SPC_EC=.bjhHRTl0NU9wbjZIdDJoYT+HQlfN10iARDIYjF3JAJeXZ4RyVs+N+YJW8v1ielnLCSXRWyxp1BlLixJM0FpIZ/rb3K/Q5XLheO+LDFwLHgfo//BhpuDIGbZLYNm77t8V3r5YTeIv3C2128+toTCbDS55R3oQToOaowLaoIVxCH21tTg4pbOAwqJ4sETvy/UuV7rIjmz95b1d5ayEqiN9UXwFhADOxhag3LDXqVmBq9s=; SPC_R_T_ID=JewcLoTqsYxjwwnTXtsa0GgYs8uYnPnXWqR9s6MMsTzwKdQStuiqxlQgh7yinl6HLaNJ0fYPSwpMu9keNqrVolVRVVFsWOoYz6DdPSdfc2Ysb8fxGIwhhYVXhz03OaN65HhWrpoow19EF2VBJHO1ULMfWcGkNnPH3nJ7ZyTzdes=",
        "x-sap-ri": "04f4846795af1a9e053ef12c01b74d06dbf3c208e9a4660f6ede",
        "af-ac-enc-sz-token": "Do5MtRu1qXOtlx+v45d7kw==|szvGgGp2+GA3BXOAxRL+tMCsPqUO9Kf33SUrzqL0VfMEZNE1RxTngd2Duf7BU00HflXg9qB7qFCD+rysUhJJCg==|MsCrBkvAHDDcji6f|08|2",
        "if-none-match-": "55b03-c326977bbf999257b3394024bc3e87c5",
        "x-api-source": "rn",
        "af-ac-cli-id": "68f27089dcf78bff6039f21b8ab9ae8f",
        "6a71872e": "MMTZUr4ubljW+vhkY7C+o7TnOYO=",
        "x-shopee-language": "id",
        "client-request-id": "84c7cc4f-82ac-4e1f-9737-1fb7949900f7.711",
        "user-agent": "iOS app iPhone Shopee appver=34152 language=id app_type=1 platform=native_ios os_ver=18.1.1 Cronet/102.0.5005.61",
        "1dccf0d1": "w/vY0tKRubFqpzW8hjArxKp85ns=",
        "x-shopee-client-timezone": "Asia/Jakarta",
        "b8bd2521": "JTCn1CckBeQE4KhLTdCadMLLhtM9jUtVABLfzWY53zpBPq67NzZEfo0J234ZamPbdWJOIBoBdHHMHPOR24oinpFawBBQUwH0W/7HtrhIRjxbDuee1czYMMFlujoTzhRnDLGkclCRR865DnfVf4696pyXq8nrMyF8+nIODXTkvsj4ICITA/VKMtBYzuQTLPAoNCDICm2AH7JWObxq28fKc6N51ap4F1jGrfELR0MW7gnGOzVBDoedgqWL9rSCOdKKg+N0boQ9vwnhb3XjYr0w76SN0+QLaHa30y9ajZvOSSQK+WjLlGiqGMrcoW1mgLfBUoyHbX8ee8TxDCXRUa+olJ0lauiQHSV/V4RUofKjTqJdea50iRIjrOS048NtFy21qwJUCz3fqvrlMpH6MlgeqpZApcX7yPJiI0jivz6dVudzcx+E5LoHBJvmx3EzdZah3rKr2GtxLN1ueJ2uA2lZb49WEDy6sTwoJR4Ol6dCK+kYZ2PHJdhflBE/Z17bFp1MLslFIw2tUgcvJb+uuintXUdygT/oi+dZsl9T88NDvwwg9PTnYDJYjjkPTCWP5T1eEZb0sAr7YxIAFfDlac1PG8tn2V7RzudSJ519lKUvTurkDsRNQN9nIWxy9KT0krtqyZhHzJ8ixh1Bq220",
        "accept": "*/*",
        "referer": "https://mall.shopee.co.id/",
        "accept-language": "id-ID,id,en-US,en"
      }
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
});

export { getPopup as default };
//# sourceMappingURL=getPopup.mjs.map
