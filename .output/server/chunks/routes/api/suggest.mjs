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

const suggest = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const cookie = body.cookies;
  const kw = body.kw;
  const myHeaders = new Headers();
  myHeaders.append("Host", "shopee.co.id");
  myHeaders.append("Cookie", cookie);
  myHeaders.append("sec-ch-ua", '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"');
  myHeaders.append("x-sz-sdk-version", "1.10.15");
  myHeaders.append("x-shopee-language", "id");
  myHeaders.append("x-requested-with", "XMLHttpRequest");
  myHeaders.append("af-ac-enc-dat", "404decd57f112426");
  myHeaders.append("x-csrftoken", "J7N4Vjc8w6pto6lhOMVYzqu7i95tvdAr");
  myHeaders.append("sec-ch-ua-platform", '"Windows"');
  myHeaders.append("x-sap-sec", "jRcYDkUYiEHV5glj4wDj4i/jxwAM4GIj+wFA4xOjd2Ax4GDjIwF54ZljfwDA4zsjcwTz4bWjLwTZ4YDjzwFe4CWjBwTw4anjpwTp4CIjOwFN4zQjowAX4iQjo2Dj4wDj5pTN4GKj4wDv4yQj4wFf4bIjM2F64Zsj9wDV4gljHwTr4wDjuwTj4xnjFpAZ4CQjWpAF4bljbwTK4xKj4wFh4wQjXwFP4fQjFwT64zDj82Dj4wDj4CbkL3+9Dwvj4baY/IjA4wDjnwnj4iu24w9Gq/vqJzKU2yDf4wDj4wDiXyMprcfu1+St+sYzswvj4wF21c5w4pDj4wDjdglf4wTvOpFD9FfCW9Dg4wDj4i4Yuwnj4xDg4wDj4wFw6v9xFpDj8ZF6d9SE4w9e7ntmT/Fz4pDjtwvj4Znr7y8eJgXfwwWj4bQf4wDj4wDwiwWj4gr2Cu/54pDj4wDjTbPhmcAV4uDjWwvj4lIg4wF54pDjdwnj4aQf4wDj4wDvkySUAn6sd3Ej4xE21akH9gyPGOsj4xzl4wDjdjDi4wAwDayxPdJlHJUL7ie6zZ+fYzvA2KwTZZFoaySZh8D9NWRumVFQKrQmdLv4SHon+6vZB9H+xUzamuEvO2KDdzXD0lJv7/H9XGo9O+wlOzetexpvCMWP0r5ao5K+Q+H5TVTA/WjKanBMe6WDo14ER4xe0vdc/9T9f1eJTH9ezzMJBI5ymwBkl/RH8R2GLht+rHKlm3WRObLaHmuSihnjSXeoU/MgrZnWZykC/PvmlKPYHTNMOBgCmNtQD4zWnIvrjbsI6teVRWxRWdBSAw8tLZ6IPYdBad7///ST0oOKV0b62ncgDBllFH9a1II+0Lvpo5y46qYU0KeErXm2/Fi17kjBD9eH5PF/G1f4cs6d/vXdc54s69DsiSuvOOp+of7CPA3sX6Du7WlaUETM9IXWDZEONfmg4VNqIZfFEIMETPfLDLGKdD15FUlwvd2ZDnbfH6N1yRU7F5ye9SuZ9IijKPwIkfUEg7x3VlRfcQUFTn+f/a8J755M0MP8cgoz4s7IsxIz4wDjZ8y6GpIj4wD5pe8MpsnO62Dj4wDz4wDjAw1Evplj4wF7V8REswDj4gowWkBQmP5ZvN6lz/AaUR4KF5YX0+d2mg21W9QRWg6lUrrmyGuYC+S+F++92940WPRUWkG4lM0t4wDj4wQj4wAKA9AASzkI8lwfXRDj4wDj+pDj4baFTgDu1CDEicRgjkvs5ZfuqGpS3JdFBNBBpfd1NvrUP4pweC8PMo1rAGT+DetoGrQvxZGXY8D+A73BmPivGCYQYpoayhwUlNXFml00T5jeeavl4wfj4wAST4Vkr2Dj4aCj4wAq1O524jdkqA7RnJBzTfkkmMysZuybg+HUTNNlSjRUv5Aam+mr8fkKYANDXC+VvA02gfdV2rionI9vWRCk84NZvA+YjoSqzR0p8XRs0lq0iO40mmF58WDj4wDj4wDj4wDZ4wDjvTNbD/ynUy9Lg5aG2isj4wlj4wA5Ajri4wDj4wvj4wAbVuDj5wDj4z4diWIw4wDjpZUdpnJB7sDj4wDj42Dj4zod4wDz4wDjlgj9nwIj4wTuZD0RR8dqGplj4wDhMO8mIwDj4f387Bc9aYiKIwDj4CU+psZ+sZZd4wDj4wnj4wDlJfxj");
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36");
  myHeaders.append("x-api-source", "pc");
  myHeaders.append("content-type", "application/json");
  myHeaders.append("accept", "application/json");
  myHeaders.append("x-sap-ri", "755be9663bae1971004be13404016d0ec3626ac2afb4ee41bf03");
  myHeaders.append("af-ac-enc-sz-token", "tioPJPlJPchxqPYZHWRhtA==|We3m2ptSEfjqpT2yI68grULpVouLBCyVpNMbQjufWENrXOqnAzAAHj2ncdaqERMCQ6VOtNrVJi8=|ZAYmKGKZhVvtq2Hs|08|3");
  myHeaders.append("sz-token", "tioPJPlJPchxqPYZHWRhtA==|We3m2ptSEfjqpT2yI68grULpVouLBCyVpNMbQjufWENrXOqnAzAAHj2ncdaqERMCQ6VOtNrVJi8=|ZAYmKGKZhVvtq2Hs|08|3");
  myHeaders.append("sec-fetch-site", "same-origin");
  myHeaders.append("sec-fetch-mode", "cors");
  myHeaders.append("sec-fetch-dest", "empty");
  myHeaders.append("referer", "https://shopee.co.id/search?keyword=setrikaan%20philips%20original%20anti%20lengket&trackingId=searchhint-1726567912-42591476-74dd-11ef-93d6-aa2c089e7a1a");
  myHeaders.append("accept-language", "en-US,en;q=0.9,id;q=0.8,ru;q=0.7");
  myHeaders.append("priority", "u=1, i");
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const res = fetch(`https://shopee.co.id/api/v4/search/search_hint?keyword=${kw}&search_type=0&version=1`, requestOptions).then((response) => response.json());
  return res;
});

export { suggest as default };
//# sourceMappingURL=suggest.mjs.map
