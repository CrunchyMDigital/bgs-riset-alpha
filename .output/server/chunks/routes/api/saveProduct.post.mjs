import { d as defineEventHandler, r as readBody, u as useRuntimeConfig } from '../../runtime.mjs';
import PocketBase from 'pocketbase';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import '@primevue/core/base/style';
import '@primeuix/utils/object';
import '@primeuix/styled';
import 'node:fs';
import 'node:url';

const saveProduct_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const prod = body.product;
  body.auth;
  const runtimeConfig = useRuntimeConfig();
  const pb = new PocketBase(runtimeConfig.public.MASTER_DB);
  try {
    return await pb.collection("products").create(prod);
  } catch (error) {
    return error;
  }
  const exists = await pb.collection("products").getFirstListItem(`itemId="${prod.itemId}"`);
  try {
    const exists2 = await pb.collection("products").getFirstListItem(`itemId="${prod.itemId}"`);
    return "aaa";
  } catch (error) {
    return error;
  }
  if (!exists.length) {
    return await pb.collection("products").create(prod);
  } else {
    pb.admins.authWithPassword("admincrunchy@gmail.com", "password123");
    prod.last_checked = /* @__PURE__ */ new Date();
    return prod;
  }
});

export { saveProduct_post as default };
//# sourceMappingURL=saveProduct.post.mjs.map
