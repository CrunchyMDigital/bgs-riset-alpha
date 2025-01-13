import{q as D}from"./CFvPMSyN.js";class p extends Error{constructor(e){var t,s,i,n;super("ClientResponseError"),this.url="",this.status=0,this.response={},this.isAbort=!1,this.originalError=null,Object.setPrototypeOf(this,p.prototype),e!==null&&typeof e=="object"&&(this.url=typeof e.url=="string"?e.url:"",this.status=typeof e.status=="number"?e.status:0,this.isAbort=!!e.isAbort,this.originalError=e.originalError,e.response!==null&&typeof e.response=="object"?this.response=e.response:e.data!==null&&typeof e.data=="object"?this.response=e.data:this.response={}),this.originalError||e instanceof p||(this.originalError=e),typeof DOMException<"u"&&e instanceof DOMException&&(this.isAbort=!0),this.name="ClientResponseError "+this.status,this.message=(t=this.response)==null?void 0:t.message,this.message||(this.isAbort?this.message="The request was autocancelled. You can find more info in https://github.com/pocketbase/js-sdk#auto-cancellation.":(n=(i=(s=this.originalError)==null?void 0:s.cause)==null?void 0:i.message)!=null&&n.includes("ECONNREFUSED ::1")?this.message="Failed to connect to the PocketBase server. Try changing the SDK URL from localhost to 127.0.0.1 (https://github.com/pocketbase/js-sdk/issues/21).":this.message="Something went wrong while processing your request.")}get data(){return this.response}toJSON(){return{...this}}}const P=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;function K(r,e){const t={};if(typeof r!="string")return t;const s=Object.assign({},{}).decode||_;let i=0;for(;i<r.length;){const n=r.indexOf("=",i);if(n===-1)break;let o=r.indexOf(";",i);if(o===-1)o=r.length;else if(o<n){i=r.lastIndexOf(";",n-1)+1;continue}const a=r.slice(i,n).trim();if(t[a]===void 0){let c=r.slice(n+1,o).trim();c.charCodeAt(0)===34&&(c=c.slice(1,-1));try{t[a]=s(c)}catch{t[a]=c}}i=o+1}return t}function A(r,e,t){const s=Object.assign({},t||{}),i=s.encode||W;if(!P.test(r))throw new TypeError("argument name is invalid");const n=i(e);if(n&&!P.test(n))throw new TypeError("argument val is invalid");let o=r+"="+n;if(s.maxAge!=null){const a=s.maxAge-0;if(isNaN(a)||!isFinite(a))throw new TypeError("option maxAge is invalid");o+="; Max-Age="+Math.floor(a)}if(s.domain){if(!P.test(s.domain))throw new TypeError("option domain is invalid");o+="; Domain="+s.domain}if(s.path){if(!P.test(s.path))throw new TypeError("option path is invalid");o+="; Path="+s.path}if(s.expires){if(!function(c){return Object.prototype.toString.call(c)==="[object Date]"||c instanceof Date}(s.expires)||isNaN(s.expires.valueOf()))throw new TypeError("option expires is invalid");o+="; Expires="+s.expires.toUTCString()}if(s.httpOnly&&(o+="; HttpOnly"),s.secure&&(o+="; Secure"),s.priority)switch(typeof s.priority=="string"?s.priority.toLowerCase():s.priority){case"low":o+="; Priority=Low";break;case"medium":o+="; Priority=Medium";break;case"high":o+="; Priority=High";break;default:throw new TypeError("option priority is invalid")}if(s.sameSite)switch(typeof s.sameSite=="string"?s.sameSite.toLowerCase():s.sameSite){case!0:o+="; SameSite=Strict";break;case"lax":o+="; SameSite=Lax";break;case"strict":o+="; SameSite=Strict";break;case"none":o+="; SameSite=None";break;default:throw new TypeError("option sameSite is invalid")}return o}function _(r){return r.indexOf("%")!==-1?decodeURIComponent(r):r}function W(r){return encodeURIComponent(r)}const B=typeof navigator<"u"&&navigator.product==="ReactNative"||typeof global<"u"&&global.HermesInternal;let U;function O(r){if(r)try{const e=decodeURIComponent(U(r.split(".")[1]).split("").map(function(t){return"%"+("00"+t.charCodeAt(0).toString(16)).slice(-2)}).join(""));return JSON.parse(e)||{}}catch{}return{}}function L(r,e=0){let t=O(r);return!(Object.keys(t).length>0&&(!t.exp||t.exp-e>Date.now()/1e3))}U=typeof atob!="function"||B?r=>{let e=String(r).replace(/=+$/,"");if(e.length%4==1)throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");for(var t,s,i=0,n=0,o="";s=e.charAt(n++);~s&&(t=i%4?64*t+s:s,i++%4)?o+=String.fromCharCode(255&t>>(-2*i&6)):0)s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(s);return o}:atob;const q="pb_auth";class M{constructor(){this.baseToken="",this.baseModel=null,this._onChangeCallbacks=[]}get token(){return this.baseToken}get model(){return this.baseModel}get isValid(){return!L(this.token)}get isAdmin(){return O(this.token).type==="admin"}get isAuthRecord(){return O(this.token).type==="authRecord"}save(e,t){this.baseToken=e||"",this.baseModel=t||null,this.triggerChange()}clear(){this.baseToken="",this.baseModel=null,this.triggerChange()}loadFromCookie(e,t=q){const s=K(e||"")[t]||"";let i={};try{i=JSON.parse(s),(typeof i===null||typeof i!="object"||Array.isArray(i))&&(i={})}catch{}this.save(i.token||"",i.model||null)}exportToCookie(e,t=q){var c,h;const s={secure:!0,sameSite:!0,httpOnly:!0,path:"/"},i=O(this.token);s.expires=i!=null&&i.exp?new Date(1e3*i.exp):new Date("1970-01-01"),e=Object.assign({},s,e);const n={token:this.token,model:this.model?JSON.parse(JSON.stringify(this.model)):null};let o=A(t,JSON.stringify(n),e);const a=typeof Blob<"u"?new Blob([o]).size:o.length;if(n.model&&a>4096){n.model={id:(c=n==null?void 0:n.model)==null?void 0:c.id,email:(h=n==null?void 0:n.model)==null?void 0:h.email};const S=["collectionId","username","verified"];for(const m in this.model)S.includes(m)&&(n.model[m]=this.model[m]);o=A(t,JSON.stringify(n),e)}return o}onChange(e,t=!1){return this._onChangeCallbacks.push(e),t&&e(this.token,this.model),()=>{for(let s=this._onChangeCallbacks.length-1;s>=0;s--)if(this._onChangeCallbacks[s]==e)return delete this._onChangeCallbacks[s],void this._onChangeCallbacks.splice(s,1)}}triggerChange(){for(const e of this._onChangeCallbacks)e&&e(this.token,this.model)}}class $ extends M{constructor(e="pocketbase_auth"){super(),this.storageFallback={},this.storageKey=e,this._bindStorageEvent()}get token(){return(this._storageGet(this.storageKey)||{}).token||""}get model(){return(this._storageGet(this.storageKey)||{}).model||null}save(e,t){this._storageSet(this.storageKey,{token:e,model:t}),super.save(e,t)}clear(){this._storageRemove(this.storageKey),super.clear()}_storageGet(e){if(typeof window<"u"&&(window!=null&&window.localStorage)){const t=window.localStorage.getItem(e)||"";try{return JSON.parse(t)}catch{return t}}return this.storageFallback[e]}_storageSet(e,t){if(typeof window<"u"&&(window!=null&&window.localStorage)){let s=t;typeof t!="string"&&(s=JSON.stringify(t)),window.localStorage.setItem(e,s)}else this.storageFallback[e]=t}_storageRemove(e){var t;typeof window<"u"&&(window!=null&&window.localStorage)&&((t=window.localStorage)==null||t.removeItem(e)),delete this.storageFallback[e]}_bindStorageEvent(){typeof window<"u"&&(window!=null&&window.localStorage)&&window.addEventListener&&window.addEventListener("storage",e=>{if(e.key!=this.storageKey)return;const t=this._storageGet(this.storageKey)||{};super.save(t.token||"",t.model||null)})}}class w{constructor(e){this.client=e}}class G extends w{async getAll(e){return e=Object.assign({method:"GET"},e),this.client.send("/api/settings",e)}async update(e,t){return t=Object.assign({method:"PATCH",body:e},t),this.client.send("/api/settings",t)}async testS3(e="storage",t){return t=Object.assign({method:"POST",body:{filesystem:e}},t),this.client.send("/api/settings/test/s3",t).then(()=>!0)}async testEmail(e,t,s){return s=Object.assign({method:"POST",body:{email:e,template:t}},s),this.client.send("/api/settings/test/email",s).then(()=>!0)}async generateAppleClientSecret(e,t,s,i,n,o){return o=Object.assign({method:"POST",body:{clientId:e,teamId:t,keyId:s,privateKey:i,duration:n}},o),this.client.send("/api/settings/apple/generate-client-secret",o)}}class I extends w{decode(e){return e}async getFullList(e,t){if(typeof e=="number")return this._getFullList(e,t);let s=500;return(t=Object.assign({},e,t)).batch&&(s=t.batch,delete t.batch),this._getFullList(s,t)}async getList(e=1,t=30,s){return(s=Object.assign({method:"GET"},s)).query=Object.assign({page:e,perPage:t},s.query),this.client.send(this.baseCrudPath,s).then(i=>{var n;return i.items=((n=i.items)==null?void 0:n.map(o=>this.decode(o)))||[],i})}async getFirstListItem(e,t){return(t=Object.assign({requestKey:"one_by_filter_"+this.baseCrudPath+"_"+e},t)).query=Object.assign({filter:e,skipTotal:1},t.query),this.getList(1,1,t).then(s=>{var i;if(!((i=s==null?void 0:s.items)!=null&&i.length))throw new p({status:404,response:{code:404,message:"The requested resource wasn't found.",data:{}}});return s.items[0]})}async getOne(e,t){if(!e)throw new p({url:this.client.buildUrl(this.baseCrudPath+"/"),status:404,response:{code:404,message:"Missing required record id.",data:{}}});return t=Object.assign({method:"GET"},t),this.client.send(this.baseCrudPath+"/"+encodeURIComponent(e),t).then(s=>this.decode(s))}async create(e,t){return t=Object.assign({method:"POST",body:e},t),this.client.send(this.baseCrudPath,t).then(s=>this.decode(s))}async update(e,t,s){return s=Object.assign({method:"PATCH",body:t},s),this.client.send(this.baseCrudPath+"/"+encodeURIComponent(e),s).then(i=>this.decode(i))}async delete(e,t){return t=Object.assign({method:"DELETE"},t),this.client.send(this.baseCrudPath+"/"+encodeURIComponent(e),t).then(()=>!0)}_getFullList(e=500,t){(t=t||{}).query=Object.assign({skipTotal:1},t.query);let s=[],i=async n=>this.getList(n,e||500,t).then(o=>{const a=o.items;return s=s.concat(a),a.length==o.perPage?i(n+1):s});return i(1)}}function u(r,e,t,s){const i=s!==void 0;return i||t!==void 0?i?(console.warn(r),e.body=Object.assign({},e.body,t),e.query=Object.assign({},e.query,s),e):Object.assign(e,t):e}function E(r){var e;(e=r._resetAutoRefresh)==null||e.call(r)}class H extends I{get baseCrudPath(){return"/api/admins"}async update(e,t,s){return super.update(e,t,s).then(i=>{var n,o;return((n=this.client.authStore.model)==null?void 0:n.id)===i.id&&((o=this.client.authStore.model)==null?void 0:o.collectionId)===void 0&&this.client.authStore.save(this.client.authStore.token,i),i})}async delete(e,t){return super.delete(e,t).then(s=>{var i,n;return s&&((i=this.client.authStore.model)==null?void 0:i.id)===e&&((n=this.client.authStore.model)==null?void 0:n.collectionId)===void 0&&this.client.authStore.clear(),s})}authResponse(e){const t=this.decode((e==null?void 0:e.admin)||{});return e!=null&&e.token&&(e!=null&&e.admin)&&this.client.authStore.save(e.token,t),Object.assign({},e,{token:(e==null?void 0:e.token)||"",admin:t})}async authWithPassword(e,t,s,i){let n={method:"POST",body:{identity:e,password:t}};n=u("This form of authWithPassword(email, pass, body?, query?) is deprecated. Consider replacing it with authWithPassword(email, pass, options?).",n,s,i);const o=n.autoRefreshThreshold;delete n.autoRefreshThreshold,n.autoRefresh||E(this.client);let a=await this.client.send(this.baseCrudPath+"/auth-with-password",n);return a=this.authResponse(a),o&&function(h,S,m,T){E(h);const y=h.beforeSend,f=h.authStore.model,k=h.authStore.onChange((g,l)=>{(!g||(l==null?void 0:l.id)!=(f==null?void 0:f.id)||(l!=null&&l.collectionId||f!=null&&f.collectionId)&&(l==null?void 0:l.collectionId)!=(f==null?void 0:f.collectionId))&&E(h)});h._resetAutoRefresh=function(){k(),h.beforeSend=y,delete h._resetAutoRefresh},h.beforeSend=async(g,l)=>{var v;const R=h.authStore.token;if((v=l.query)!=null&&v.autoRefresh)return y?y(g,l):{url:g,sendOptions:l};let d=h.authStore.isValid;if(d&&L(h.authStore.token,S))try{await m()}catch{d=!1}d||await T();const C=l.headers||{};for(let b in C)if(b.toLowerCase()=="authorization"&&R==C[b]&&h.authStore.token){C[b]=h.authStore.token;break}return l.headers=C,y?y(g,l):{url:g,sendOptions:l}}}(this.client,o,()=>this.authRefresh({autoRefresh:!0}),()=>this.authWithPassword(e,t,Object.assign({autoRefresh:!0},n))),a}async authRefresh(e,t){let s={method:"POST"};return s=u("This form of authRefresh(body?, query?) is deprecated. Consider replacing it with authRefresh(options?).",s,e,t),this.client.send(this.baseCrudPath+"/auth-refresh",s).then(this.authResponse.bind(this))}async requestPasswordReset(e,t,s){let i={method:"POST",body:{email:e}};return i=u("This form of requestPasswordReset(email, body?, query?) is deprecated. Consider replacing it with requestPasswordReset(email, options?).",i,t,s),this.client.send(this.baseCrudPath+"/request-password-reset",i).then(()=>!0)}async confirmPasswordReset(e,t,s,i,n){let o={method:"POST",body:{token:e,password:t,passwordConfirm:s}};return o=u("This form of confirmPasswordReset(resetToken, password, passwordConfirm, body?, query?) is deprecated. Consider replacing it with confirmPasswordReset(resetToken, password, passwordConfirm, options?).",o,i,n),this.client.send(this.baseCrudPath+"/confirm-password-reset",o).then(()=>!0)}}const J=["requestKey","$cancelKey","$autoCancel","fetch","headers","body","query","params","cache","credentials","headers","integrity","keepalive","method","mode","redirect","referrer","referrerPolicy","signal","window"];function x(r){if(r){r.query=r.query||{};for(let e in r)J.includes(e)||(r.query[e]=r[e],delete r[e])}}class N extends w{constructor(){super(...arguments),this.clientId="",this.eventSource=null,this.subscriptions={},this.lastSentSubscriptions=[],this.maxConnectTimeout=15e3,this.reconnectAttempts=0,this.maxReconnectAttempts=1/0,this.predefinedReconnectIntervals=[200,300,500,1e3,1200,1500,2e3],this.pendingConnects=[]}get isConnected(){return!!this.eventSource&&!!this.clientId&&!this.pendingConnects.length}async subscribe(e,t,s){var o;if(!e)throw new Error("topic must be set.");let i=e;if(s){x(s=Object.assign({},s));const a="options="+encodeURIComponent(JSON.stringify({query:s.query,headers:s.headers}));i+=(i.includes("?")?"&":"?")+a}const n=function(a){const c=a;let h;try{h=JSON.parse(c==null?void 0:c.data)}catch{}t(h||{})};return this.subscriptions[i]||(this.subscriptions[i]=[]),this.subscriptions[i].push(n),this.isConnected?this.subscriptions[i].length===1?await this.submitSubscriptions():(o=this.eventSource)==null||o.addEventListener(i,n):await this.connect(),async()=>this.unsubscribeByTopicAndListener(e,n)}async unsubscribe(e){var s;let t=!1;if(e){const i=this.getSubscriptionsByTopic(e);for(let n in i)if(this.hasSubscriptionListeners(n)){for(let o of this.subscriptions[n])(s=this.eventSource)==null||s.removeEventListener(n,o);delete this.subscriptions[n],t||(t=!0)}}else this.subscriptions={};this.hasSubscriptionListeners()?t&&await this.submitSubscriptions():this.disconnect()}async unsubscribeByPrefix(e){var s;let t=!1;for(let i in this.subscriptions)if((i+"?").startsWith(e)){t=!0;for(let n of this.subscriptions[i])(s=this.eventSource)==null||s.removeEventListener(i,n);delete this.subscriptions[i]}t&&(this.hasSubscriptionListeners()?await this.submitSubscriptions():this.disconnect())}async unsubscribeByTopicAndListener(e,t){var n;let s=!1;const i=this.getSubscriptionsByTopic(e);for(let o in i){if(!Array.isArray(this.subscriptions[o])||!this.subscriptions[o].length)continue;let a=!1;for(let c=this.subscriptions[o].length-1;c>=0;c--)this.subscriptions[o][c]===t&&(a=!0,delete this.subscriptions[o][c],this.subscriptions[o].splice(c,1),(n=this.eventSource)==null||n.removeEventListener(o,t));a&&(this.subscriptions[o].length||delete this.subscriptions[o],s||this.hasSubscriptionListeners(o)||(s=!0))}this.hasSubscriptionListeners()?s&&await this.submitSubscriptions():this.disconnect()}hasSubscriptionListeners(e){var t,s;if(this.subscriptions=this.subscriptions||{},e)return!!((t=this.subscriptions[e])!=null&&t.length);for(let i in this.subscriptions)if((s=this.subscriptions[i])!=null&&s.length)return!0;return!1}async submitSubscriptions(){if(this.clientId)return this.addAllSubscriptionListeners(),this.lastSentSubscriptions=this.getNonEmptySubscriptionKeys(),this.client.send("/api/realtime",{method:"POST",body:{clientId:this.clientId,subscriptions:this.lastSentSubscriptions},requestKey:this.getSubscriptionsCancelKey()}).catch(e=>{if(!(e!=null&&e.isAbort))throw e})}getSubscriptionsCancelKey(){return"realtime_"+this.clientId}getSubscriptionsByTopic(e){const t={};e=e.includes("?")?e:e+"?";for(let s in this.subscriptions)(s+"?").startsWith(e)&&(t[s]=this.subscriptions[s]);return t}getNonEmptySubscriptionKeys(){const e=[];for(let t in this.subscriptions)this.subscriptions[t].length&&e.push(t);return e}addAllSubscriptionListeners(){if(this.eventSource){this.removeAllSubscriptionListeners();for(let e in this.subscriptions)for(let t of this.subscriptions[e])this.eventSource.addEventListener(e,t)}}removeAllSubscriptionListeners(){if(this.eventSource)for(let e in this.subscriptions)for(let t of this.subscriptions[e])this.eventSource.removeEventListener(e,t)}async connect(){if(!(this.reconnectAttempts>0))return new Promise((e,t)=>{this.pendingConnects.push({resolve:e,reject:t}),this.pendingConnects.length>1||this.initConnect()})}initConnect(){this.disconnect(!0),clearTimeout(this.connectTimeoutId),this.connectTimeoutId=setTimeout(()=>{this.connectErrorHandler(new Error("EventSource connect took too long."))},this.maxConnectTimeout),this.eventSource=new EventSource(this.client.buildUrl("/api/realtime")),this.eventSource.onerror=e=>{this.connectErrorHandler(new Error("Failed to establish realtime connection."))},this.eventSource.addEventListener("PB_CONNECT",e=>{const t=e;this.clientId=t==null?void 0:t.lastEventId,this.submitSubscriptions().then(async()=>{let s=3;for(;this.hasUnsentSubscriptions()&&s>0;)s--,await this.submitSubscriptions()}).then(()=>{for(let i of this.pendingConnects)i.resolve();this.pendingConnects=[],this.reconnectAttempts=0,clearTimeout(this.reconnectTimeoutId),clearTimeout(this.connectTimeoutId);const s=this.getSubscriptionsByTopic("PB_CONNECT");for(let i in s)for(let n of s[i])n(e)}).catch(s=>{this.clientId="",this.connectErrorHandler(s)})})}hasUnsentSubscriptions(){const e=this.getNonEmptySubscriptionKeys();if(e.length!=this.lastSentSubscriptions.length)return!0;for(const t of e)if(!this.lastSentSubscriptions.includes(t))return!0;return!1}connectErrorHandler(e){if(clearTimeout(this.connectTimeoutId),clearTimeout(this.reconnectTimeoutId),!this.clientId&&!this.reconnectAttempts||this.reconnectAttempts>this.maxReconnectAttempts){for(let s of this.pendingConnects)s.reject(new p(e));return this.pendingConnects=[],void this.disconnect()}this.disconnect(!0);const t=this.predefinedReconnectIntervals[this.reconnectAttempts]||this.predefinedReconnectIntervals[this.predefinedReconnectIntervals.length-1];this.reconnectAttempts++,this.reconnectTimeoutId=setTimeout(()=>{this.initConnect()},t)}disconnect(e=!1){var t;if(clearTimeout(this.connectTimeoutId),clearTimeout(this.reconnectTimeoutId),this.removeAllSubscriptionListeners(),this.client.cancelRequest(this.getSubscriptionsCancelKey()),(t=this.eventSource)==null||t.close(),this.eventSource=null,this.clientId="",!e){this.reconnectAttempts=0;for(let s of this.pendingConnects)s.resolve();this.pendingConnects=[]}}}class V extends I{constructor(e,t){super(e),this.collectionIdOrName=t}get baseCrudPath(){return this.baseCollectionPath+"/records"}get baseCollectionPath(){return"/api/collections/"+encodeURIComponent(this.collectionIdOrName)}async subscribe(e,t,s){if(!e)throw new Error("Missing topic.");if(!t)throw new Error("Missing subscription callback.");return this.client.realtime.subscribe(this.collectionIdOrName+"/"+e,t,s)}async unsubscribe(e){return e?this.client.realtime.unsubscribe(this.collectionIdOrName+"/"+e):this.client.realtime.unsubscribeByPrefix(this.collectionIdOrName)}async getFullList(e,t){if(typeof e=="number")return super.getFullList(e,t);const s=Object.assign({},e,t);return super.getFullList(s)}async getList(e=1,t=30,s){return super.getList(e,t,s)}async getFirstListItem(e,t){return super.getFirstListItem(e,t)}async getOne(e,t){return super.getOne(e,t)}async create(e,t){return super.create(e,t)}async update(e,t,s){return super.update(e,t,s).then(i=>{var n,o,a;return((n=this.client.authStore.model)==null?void 0:n.id)!==(i==null?void 0:i.id)||((o=this.client.authStore.model)==null?void 0:o.collectionId)!==this.collectionIdOrName&&((a=this.client.authStore.model)==null?void 0:a.collectionName)!==this.collectionIdOrName||this.client.authStore.save(this.client.authStore.token,i),i})}async delete(e,t){return super.delete(e,t).then(s=>{var i,n,o;return!s||((i=this.client.authStore.model)==null?void 0:i.id)!==e||((n=this.client.authStore.model)==null?void 0:n.collectionId)!==this.collectionIdOrName&&((o=this.client.authStore.model)==null?void 0:o.collectionName)!==this.collectionIdOrName||this.client.authStore.clear(),s})}authResponse(e){const t=this.decode((e==null?void 0:e.record)||{});return this.client.authStore.save(e==null?void 0:e.token,t),Object.assign({},e,{token:(e==null?void 0:e.token)||"",record:t})}async listAuthMethods(e){return e=Object.assign({method:"GET"},e),this.client.send(this.baseCollectionPath+"/auth-methods",e).then(t=>Object.assign({},t,{usernamePassword:!!(t!=null&&t.usernamePassword),emailPassword:!!(t!=null&&t.emailPassword),authProviders:Array.isArray(t==null?void 0:t.authProviders)?t==null?void 0:t.authProviders:[]}))}async authWithPassword(e,t,s,i){let n={method:"POST",body:{identity:e,password:t}};return n=u("This form of authWithPassword(usernameOrEmail, pass, body?, query?) is deprecated. Consider replacing it with authWithPassword(usernameOrEmail, pass, options?).",n,s,i),this.client.send(this.baseCollectionPath+"/auth-with-password",n).then(o=>this.authResponse(o))}async authWithOAuth2Code(e,t,s,i,n,o,a){let c={method:"POST",body:{provider:e,code:t,codeVerifier:s,redirectUrl:i,createData:n}};return c=u("This form of authWithOAuth2Code(provider, code, codeVerifier, redirectUrl, createData?, body?, query?) is deprecated. Consider replacing it with authWithOAuth2Code(provider, code, codeVerifier, redirectUrl, createData?, options?).",c,o,a),this.client.send(this.baseCollectionPath+"/auth-with-oauth2",c).then(h=>this.authResponse(h))}authWithOAuth2(...e){if(e.length>1||typeof(e==null?void 0:e[0])=="string")return console.warn("PocketBase: This form of authWithOAuth2() is deprecated and may get removed in the future. Please replace with authWithOAuth2Code() OR use the authWithOAuth2() realtime form as shown in https://pocketbase.io/docs/authentication/#oauth2-integration."),this.authWithOAuth2Code((e==null?void 0:e[0])||"",(e==null?void 0:e[1])||"",(e==null?void 0:e[2])||"",(e==null?void 0:e[3])||"",(e==null?void 0:e[4])||{},(e==null?void 0:e[5])||{},(e==null?void 0:e[6])||{});const t=(e==null?void 0:e[0])||{};let s=null;t.urlCallback||(s=j(void 0));const i=new N(this.client);function n(){s==null||s.close(),i.unsubscribe()}const o={},a=t.requestKey;return a&&(o.requestKey=a),this.listAuthMethods(o).then(c=>{var T;const h=c.authProviders.find(y=>y.name===t.provider);if(!h)throw new p(new Error(`Missing or invalid provider "${t.provider}".`));const S=this.client.buildUrl("/api/oauth2-redirect"),m=a?(T=this.client.cancelControllers)==null?void 0:T[a]:void 0;return m&&(m.signal.onabort=()=>{n()}),new Promise(async(y,f)=>{var k;try{await i.subscribe("@oauth2",async d=>{var v;const C=i.clientId;try{if(!d.state||C!==d.state)throw new Error("State parameters don't match.");if(d.error||!d.code)throw new Error("OAuth2 redirect error or missing code: "+d.error);const b=Object.assign({},t);delete b.provider,delete b.scopes,delete b.createData,delete b.urlCallback,(v=m==null?void 0:m.signal)!=null&&v.onabort&&(m.signal.onabort=null);const F=await this.authWithOAuth2Code(h.name,d.code,h.codeVerifier,S,t.createData,b);y(F)}catch(b){f(new p(b))}n()});const g={state:i.clientId};(k=t.scopes)!=null&&k.length&&(g.scope=t.scopes.join(" "));const l=this._replaceQueryParams(h.authUrl+S,g);await(t.urlCallback||function(d){s?s.location.href=d:s=j(d)})(l)}catch(g){n(),f(new p(g))}})}).catch(c=>{throw n(),c})}async authRefresh(e,t){let s={method:"POST"};return s=u("This form of authRefresh(body?, query?) is deprecated. Consider replacing it with authRefresh(options?).",s,e,t),this.client.send(this.baseCollectionPath+"/auth-refresh",s).then(i=>this.authResponse(i))}async requestPasswordReset(e,t,s){let i={method:"POST",body:{email:e}};return i=u("This form of requestPasswordReset(email, body?, query?) is deprecated. Consider replacing it with requestPasswordReset(email, options?).",i,t,s),this.client.send(this.baseCollectionPath+"/request-password-reset",i).then(()=>!0)}async confirmPasswordReset(e,t,s,i,n){let o={method:"POST",body:{token:e,password:t,passwordConfirm:s}};return o=u("This form of confirmPasswordReset(token, password, passwordConfirm, body?, query?) is deprecated. Consider replacing it with confirmPasswordReset(token, password, passwordConfirm, options?).",o,i,n),this.client.send(this.baseCollectionPath+"/confirm-password-reset",o).then(()=>!0)}async requestVerification(e,t,s){let i={method:"POST",body:{email:e}};return i=u("This form of requestVerification(email, body?, query?) is deprecated. Consider replacing it with requestVerification(email, options?).",i,t,s),this.client.send(this.baseCollectionPath+"/request-verification",i).then(()=>!0)}async confirmVerification(e,t,s){let i={method:"POST",body:{token:e}};return i=u("This form of confirmVerification(token, body?, query?) is deprecated. Consider replacing it with confirmVerification(token, options?).",i,t,s),this.client.send(this.baseCollectionPath+"/confirm-verification",i).then(()=>{const n=O(e),o=this.client.authStore.model;return o&&!o.verified&&o.id===n.id&&o.collectionId===n.collectionId&&(o.verified=!0,this.client.authStore.save(this.client.authStore.token,o)),!0})}async requestEmailChange(e,t,s){let i={method:"POST",body:{newEmail:e}};return i=u("This form of requestEmailChange(newEmail, body?, query?) is deprecated. Consider replacing it with requestEmailChange(newEmail, options?).",i,t,s),this.client.send(this.baseCollectionPath+"/request-email-change",i).then(()=>!0)}async confirmEmailChange(e,t,s,i){let n={method:"POST",body:{token:e,password:t}};return n=u("This form of confirmEmailChange(token, password, body?, query?) is deprecated. Consider replacing it with confirmEmailChange(token, password, options?).",n,s,i),this.client.send(this.baseCollectionPath+"/confirm-email-change",n).then(()=>{const o=O(e),a=this.client.authStore.model;return a&&a.id===o.id&&a.collectionId===o.collectionId&&this.client.authStore.clear(),!0})}async listExternalAuths(e,t){return t=Object.assign({method:"GET"},t),this.client.send(this.baseCrudPath+"/"+encodeURIComponent(e)+"/external-auths",t)}async unlinkExternalAuth(e,t,s){return s=Object.assign({method:"DELETE"},s),this.client.send(this.baseCrudPath+"/"+encodeURIComponent(e)+"/external-auths/"+encodeURIComponent(t),s).then(()=>!0)}_replaceQueryParams(e,t={}){let s=e,i="";e.indexOf("?")>=0&&(s=e.substring(0,e.indexOf("?")),i=e.substring(e.indexOf("?")+1));const n={},o=i.split("&");for(const a of o){if(a=="")continue;const c=a.split("=");n[decodeURIComponent(c[0].replace(/\+/g," "))]=decodeURIComponent((c[1]||"").replace(/\+/g," "))}for(let a in t)t.hasOwnProperty(a)&&(t[a]==null?delete n[a]:n[a]=t[a]);i="";for(let a in n)n.hasOwnProperty(a)&&(i!=""&&(i+="&"),i+=encodeURIComponent(a.replace(/%20/g,"+"))+"="+encodeURIComponent(n[a].replace(/%20/g,"+")));return i!=""?s+"?"+i:s}}function j(r){if(typeof window>"u"||!(window!=null&&window.open))throw new p(new Error("Not in a browser context - please pass a custom urlCallback function."));let e=1024,t=768,s=window.innerWidth,i=window.innerHeight;e=e>s?s:e,t=t>i?i:t;let n=s/2-e/2,o=i/2-t/2;return window.open(r,"popup_window","width="+e+",height="+t+",top="+o+",left="+n+",resizable,menubar=no")}class z extends I{get baseCrudPath(){return"/api/collections"}async import(e,t=!1,s){return s=Object.assign({method:"PUT",body:{collections:e,deleteMissing:t}},s),this.client.send(this.baseCrudPath+"/import",s).then(()=>!0)}}class Q extends w{async getList(e=1,t=30,s){return(s=Object.assign({method:"GET"},s)).query=Object.assign({page:e,perPage:t},s.query),this.client.send("/api/logs",s)}async getOne(e,t){if(!e)throw new p({url:this.client.buildUrl("/api/logs/"),status:404,response:{code:404,message:"Missing required log id.",data:{}}});return t=Object.assign({method:"GET"},t),this.client.send("/api/logs/"+encodeURIComponent(e),t)}async getStats(e){return e=Object.assign({method:"GET"},e),this.client.send("/api/logs/stats",e)}}class Y extends w{async check(e){return e=Object.assign({method:"GET"},e),this.client.send("/api/health",e)}}class X extends w{getUrl(e,t,s={}){if(!t||!(e!=null&&e.id)||!(e!=null&&e.collectionId)&&!(e!=null&&e.collectionName))return"";const i=[];i.push("api"),i.push("files"),i.push(encodeURIComponent(e.collectionId||e.collectionName)),i.push(encodeURIComponent(e.id)),i.push(encodeURIComponent(t));let n=this.client.buildUrl(i.join("/"));if(Object.keys(s).length){s.download===!1&&delete s.download;const o=new URLSearchParams(s);n+=(n.includes("?")?"&":"?")+o}return n}async getToken(e){return e=Object.assign({method:"POST"},e),this.client.send("/api/files/token",e).then(t=>(t==null?void 0:t.token)||"")}}class Z extends w{async getFullList(e){return e=Object.assign({method:"GET"},e),this.client.send("/api/backups",e)}async create(e,t){return t=Object.assign({method:"POST",body:{name:e}},t),this.client.send("/api/backups",t).then(()=>!0)}async upload(e,t){return t=Object.assign({method:"POST",body:e},t),this.client.send("/api/backups/upload",t).then(()=>!0)}async delete(e,t){return t=Object.assign({method:"DELETE"},t),this.client.send(`/api/backups/${encodeURIComponent(e)}`,t).then(()=>!0)}async restore(e,t){return t=Object.assign({method:"POST"},t),this.client.send(`/api/backups/${encodeURIComponent(e)}/restore`,t).then(()=>!0)}getDownloadUrl(e,t){return this.client.buildUrl(`/api/backups/${encodeURIComponent(t)}?token=${encodeURIComponent(e)}`)}}class ee{constructor(e="/",t,s="en-US"){this.cancelControllers={},this.recordServices={},this.enableAutoCancellation=!0,this.baseUrl=e,this.lang=s,this.authStore=t||new $,this.admins=new H(this),this.collections=new z(this),this.files=new X(this),this.logs=new Q(this),this.settings=new G(this),this.realtime=new N(this),this.health=new Y(this),this.backups=new Z(this)}collection(e){return this.recordServices[e]||(this.recordServices[e]=new V(this,e)),this.recordServices[e]}autoCancellation(e){return this.enableAutoCancellation=!!e,this}cancelRequest(e){return this.cancelControllers[e]&&(this.cancelControllers[e].abort(),delete this.cancelControllers[e]),this}cancelAllRequests(){for(let e in this.cancelControllers)this.cancelControllers[e].abort();return this.cancelControllers={},this}filter(e,t){if(!t)return e;for(let s in t){let i=t[s];switch(typeof i){case"boolean":case"number":i=""+i;break;case"string":i="'"+i.replace(/'/g,"\\'")+"'";break;default:i=i===null?"null":i instanceof Date?"'"+i.toISOString().replace("T"," ")+"'":"'"+JSON.stringify(i).replace(/'/g,"\\'")+"'"}e=e.replaceAll("{:"+s+"}",i)}return e}getFileUrl(e,t,s={}){return this.files.getUrl(e,t,s)}buildUrl(e){var s;let t=this.baseUrl;return typeof window>"u"||!window.location||t.startsWith("https://")||t.startsWith("http://")||(t=(s=window.location.origin)!=null&&s.endsWith("/")?window.location.origin.substring(0,window.location.origin.length-1):window.location.origin||"",this.baseUrl.startsWith("/")||(t+=window.location.pathname||"/",t+=t.endsWith("/")?"":"/"),t+=this.baseUrl),e&&(t+=t.endsWith("/")?"":"/",t+=e.startsWith("/")?e.substring(1):e),t}async send(e,t){t=this.initSendOptions(e,t);let s=this.buildUrl(e);if(this.beforeSend){const i=Object.assign({},await this.beforeSend(s,t));i.url!==void 0||i.options!==void 0?(s=i.url||s,t=i.options||t):Object.keys(i).length&&(t=i,console!=null&&console.warn&&console.warn("Deprecated format of beforeSend return: please use `return { url, options }`, instead of `return options`."))}if(t.query!==void 0){const i=this.serializeQueryParams(t.query);i&&(s+=(s.includes("?")?"&":"?")+i),delete t.query}return this.getHeader(t.headers,"Content-Type")=="application/json"&&t.body&&typeof t.body!="string"&&(t.body=JSON.stringify(t.body)),(t.fetch||fetch)(s,t).then(async i=>{let n={};try{n=await i.json()}catch{}if(this.afterSend&&(n=await this.afterSend(i,n)),i.status>=400)throw new p({url:i.url,status:i.status,data:n});return n}).catch(i=>{throw new p(i)})}initSendOptions(e,t){if((t=Object.assign({method:"GET"},t)).body=this.convertToFormDataIfNeeded(t.body),x(t),t.query=Object.assign({},t.params,t.query),t.requestKey===void 0&&(t.$autoCancel===!1||t.query.$autoCancel===!1?t.requestKey=null:(t.$cancelKey||t.query.$cancelKey)&&(t.requestKey=t.$cancelKey||t.query.$cancelKey)),delete t.$autoCancel,delete t.query.$autoCancel,delete t.$cancelKey,delete t.query.$cancelKey,this.getHeader(t.headers,"Content-Type")!==null||this.isFormData(t.body)||(t.headers=Object.assign({},t.headers,{"Content-Type":"application/json"})),this.getHeader(t.headers,"Accept-Language")===null&&(t.headers=Object.assign({},t.headers,{"Accept-Language":this.lang})),this.authStore.token&&this.getHeader(t.headers,"Authorization")===null&&(t.headers=Object.assign({},t.headers,{Authorization:this.authStore.token})),this.enableAutoCancellation&&t.requestKey!==null){const s=t.requestKey||(t.method||"GET")+e;delete t.requestKey,this.cancelRequest(s);const i=new AbortController;this.cancelControllers[s]=i,t.signal=i.signal}return t}convertToFormDataIfNeeded(e){if(typeof FormData>"u"||e===void 0||typeof e!="object"||e===null||this.isFormData(e)||!this.hasBlobField(e))return e;const t=new FormData;for(const s in e){const i=e[s];if(typeof i!="object"||this.hasBlobField({data:i})){const n=Array.isArray(i)?i:[i];for(let o of n)t.append(s,o)}else{let n={};n[s]=i,t.append("@jsonPayload",JSON.stringify(n))}}return t}hasBlobField(e){for(const t in e){const s=Array.isArray(e[t])?e[t]:[e[t]];for(const i of s)if(typeof Blob<"u"&&i instanceof Blob||typeof File<"u"&&i instanceof File)return!0}return!1}getHeader(e,t){e=e||{},t=t.toLowerCase();for(let s in e)if(s.toLowerCase()==t)return e[s];return null}isFormData(e){return e&&(e.constructor.name==="FormData"||typeof FormData<"u"&&e instanceof FormData)}serializeQueryParams(e){const t=[];for(const s in e){if(e[s]===null)continue;const i=e[s],n=encodeURIComponent(s);if(Array.isArray(i))for(const o of i)t.push(n+"="+encodeURIComponent(o));else i instanceof Date?t.push(n+"="+encodeURIComponent(i.toISOString())):typeof i!==null&&typeof i=="object"?t.push(n+"="+encodeURIComponent(JSON.stringify(i))):t.push(n+"="+encodeURIComponent(i))}return t.join("&")}}const se=()=>{const r=D();return new ee(r.public.MASTER_DB)};export{se as u};
