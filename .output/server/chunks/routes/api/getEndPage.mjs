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

const getEndPage = defineEventHandler(async (event) => {
  const query = getQuery(event);
  query.id;
  const response = await axios.post(
    "https://live.shopee.co.id/api/v1/endpage/sessions",
    {
      "ctx_id": "bef285d8-5d9d-4060-b814-aea6e7d33003-1725609234822-380154",
      "device_id": "bef285d8-5d9d-4060-b814-aea6e7d33003",
      "limit": 30,
      "offset": 0,
      "page_no": 3
      // 'user_context': `{"from_source":"share","filter_streaming_list":[${sessId}],"rcmd_streaming_list":[{"streaming_id":${sessId},"streamer_id":6931724}]}`
    },
    {
      headers: {
        "accept-language": "en-US,en;q=0.7",
        // 'af-ac-enc-dat': '9d11f0037a45a81b',
        // 'af-ac-enc-sz-token': 'Gewp30xGkzRy+qvlBgrhGw==|pfGR9119kGnPyJi/AqtyT+rCvZ4VyRZIZOzQ8aCVYGLVnWXkUrF/qPPFjLSh94d8Bw9iF4jShzm2Kg==|vNejBIeD8nJ4VQ+4|08|3',
        "cache-control": "no-cache",
        "client-info": "os=2;platform=9;scene_id=17;device_id=6fb660a3-512d-4448-a76e-e4d1cce21465",
        // 'cookie': 'SPC_SI=j2OfZgAAAABOS2hsY0ZEeusqrAUAAAAAM2haOEhnMzY=; SPC_F=aqIFVCFcu1I4TJxVDwh7Qv2CmM9VprJt; REC_T_ID=fab66ac0-6b1e-11ef-aa4b-5ea1037c76ab; SPC_EC=.OUZ3YzFLV1BoNnZJbXl5QfC9zlvKV71Kk5DEQgSB0xCWGEB0mByRbLq0Q0zveFcq+OEblWgSelMlZD740lH+UaASSZrH2F3u6LGOgeepFzf0adEwVC6zovuTGQe46xZJrJzB3gMcnIqhmkNDemlfeM46vC4jRovoc/vTDSBSaNAVWg9ya5+ym1wH++v3qRzgIOLoAiXvNaSKM10S3gFemK2jcr4QAIM5lbQn0PdNOL5W9CcI59G/9jkKThBSgsDO; SPC_ST=.OUZ3YzFLV1BoNnZJbXl5QfC9zlvKV71Kk5DEQgSB0xCWGEB0mByRbLq0Q0zveFcq+OEblWgSelMlZD740lH+UaASSZrH2F3u6LGOgeepFzf0adEwVC6zovuTGQe46xZJrJzB3gMcnIqhmkNDemlfeM46vC4jRovoc/vTDSBSaNAVWg9ya5+ym1wH++v3qRzgIOLoAiXvNaSKM10S3gFemK2jcr4QAIM5lbQn0PdNOL5W9CcI59G/9jkKThBSgsDO; SPC_CLIENTID=YXFJRlZDRmN1MUk0pehmoquugyizkwao; SPC_U=20196017; SPC_R_T_IV=MFFka25BZzhJanBwY3VMTw==; SPC_T_ID=onY/iIDT3MU5wlLY0/vF9T4tv22Ssaj6ctKfc02ZrX1piiv7MQkyL/i8CA+gxC9R2dAYR61fZKl4ga/U56Wtppi44tY3E8a/Uz/eqW08nzLJbtYDQH07cdCqAKy9HALAJnUFC7M2JOoXgS9pzvcQT2iNnHYqXGMe1CtdEhRdoOY=; SPC_T_IV=MFFka25BZzhJanBwY3VMTw==; SPC_R_T_ID=onY/iIDT3MU5wlLY0/vF9T4tv22Ssaj6ctKfc02ZrX1piiv7MQkyL/i8CA+gxC9R2dAYR61fZKl4ga/U56Wtppi44tY3E8a/Uz/eqW08nzLJbtYDQH07cdCqAKy9HALAJnUFC7M2JOoXgS9pzvcQT2iNnHYqXGMe1CtdEhRdoOY=; _QPWSDCXHZQA=56add7f7-81bb-48a9-e665-cf0de0b0466b; REC7iLP4Q=03e6eb87-8ecd-4f6e-aef5-fd313715f1f2; SPC_CDS_CHAT=7f7e6acd-df0e-4e26-858e-59391b358f46; _sapid=e7f157ee41088e88e383edc01c051fc1f9a2150571a2d1dde486f0fc; shopee_webUnique_ccd=flrzZs4hs1KP5znB6SHQVQ%3D%3D%7CnvGR9119kGnPyJi%2FAqtyT%2BrCvZ4VyRZIZOzQ8WyLYWLVnWXkUrF%2FqPPFjLSh94d8Bw9iF4jShzk%3D%7CvNejBIeD8nJ4VQ%2B4%7C08%7C3; ds=bf79b8abac356138bf3a1ca1ffa8332d',
        "origin": "https://live.shopee.co.id",
        "pragma": "no-cache",
        "priority": "u=1, i",
        // 'referer': `https://live.shopee.co.id/p/live-end?type=guest&room_id=473252&session=${sessId}&shop_id=6930432&host_user_id=6931724&product_total_count=100&current_member_count=359&follow_status=0&can_show_items&bgurl=id-11134104-7r98y-lwtuus6ev2cs10&host_avatar=id-11134233-7r98r-lsiq0caso7k9c1&host_name=re.colouring&session_title=MAU%20APA%20KAKAK%20KU%20%3F%3F!!&is_seller=1`,
        "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Brave";v="128"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "x-livestreaming-auth": "ls_web_v1_30001_1725609238_cnulir9rs0q9fc7ivmwjkykliha7ww28f1ir|lEqmgpA6ysag87IlPSVyeg4tQGlKq6MX2uaB8tPuR3k=",
        "x-livestreaming-source": "shopee",
        // 'x-ls-sz-token': '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',
        // 'x-sap-ri': '16b5da6646217e4ad7c3cf33030123231d7a4621aabe96721674',
        // 'x-sap-sec': 'eAPbzwMo0vMSLvMSKEM4LvPSKEMSLvPSLvMoLvMSBvPSL9PeLvN9L/MSKvMSLXkmTNU4LvMSZv3SLDgeLvN7cBNe4aK3NEMVe7wFMRl8kBhq5ulqH8QOnbhPwJDLIqCUR1rtYCIRI4tUGcdGJwSEzvs28DevtpQg+qpUSPNH3kY/bes5qKMoIRyAbv7mZYVMjrxFzx3/9TJBSx9D7h1upo7KzoY2dYnvSN6Sm5rcGRJ/+BVPLjWb6kZo3YcUCuSTicx1aRKz1B6HtwV+9Q/s6O39R34o4fsnU+P89mFXhWE/1lKbkm1S3YEqpwLuZeNhLWGWBbIxlBGKO90kFQXlC6UfPWV6AxEMC+i+uehvR5rJQ2NQwhKQyjw+yfsnVAsIIozYspsTbQxNjtbfQZNyk+HkDF/YIU+Q/SO3p4EOD1lBo2ntWznYRyF9C9ZS2y5l3SLIHjaUmiMAKJNUuq1V6QOIUkRr6wSI5baxw+B3zSudgz08IueKyAV11b1MYSJRbKPa+VZxIGtEsMC2niwcEQRq60KPO7p7Qm6LNq74Cu6ZtZyhA2t2xQ8dJR4UbXGmqNnQE8HQG8sCDlxH3Kob+kxRoydf4meTLbzPufu12kniT7+x2wzNCaDcfmgc55navcuCcQUXoALgyJbDSA7FX/OGzhQ02y/r7opmNY0lhGQH6coOixPmVienFPLSoWQwS92uWbq740NSP2GI2n4uulKGH5TgKuInzb8mdk47cw7ff8I9h6RCFDcbcqUrGX2dhouGgNHOudgANho9dhLPU4M+FEF0pZmAL0Dog52EPNSQoATnnkvFVCBtaFkG+RLfp/rW88wNC6UrJTLgCP8ZR+aGTgRcnt1216qBtLGutgNyxwovhCHmvCa6sMhn+s24oq+yy931wWlNeng8gxLl8twQV52ZBz08IaI4t78OlxAIOkhesxPNbe7Nug/hWhWGQOwdJGsfK6SNiYvXN9mp++GqGcDfC7AW7UZrifnRVbIJIAr4TpwmvEqA0xfFC0nipUmsk1B2CFfmvPqSyP3ziLlc6InjZ+Q09aeK2jf1WsBnht8/NAiFJ2m7c4AlyjfuNSZLpbRkb1ZKxV+ys0zKFVRJYAsWBA1+itSlHIE4YIQdHhZlpPKyoDOuGRx9F7f1cdYw3McmIyPizY9zVclreKXjuJci+3BXrIB8Wl0MGmIlU1JBYYHJbAgWbAx4VqgiPJ5SZwv1LlIV+j/1HyngpRiZHO6+PcRSm6XGW5cwO2HqBKHRkHAG3OmG7Srg6j2GP9cSkynNK/MSLVEqcY/nRY3SbX1gT/gSLvM+LvMS/vMSLFrVyuwWS5UWckKgaG1hNObqlnxo2vMSLVKvcVsqOH/vLvMSLW9gTNU4LvMS7vMSLUPSLv+MIHihYfM+ItrsPiPLLmPVwG/kNEgSLvMyRY3wRVcwOEMSLvM4Lv8S2vMoLvgSLvM4LvMS7vMSLUPSLv+fC7ULElj7OSzmhcYi9m+OIiK5ZvgSLvMCcbcxc0cZOxMSLvB=',
        "x-sz-sdk-version": "1.10.7"
      }
    }
  );
  return response.data;
});

export { getEndPage as default };
//# sourceMappingURL=getEndPage.mjs.map
