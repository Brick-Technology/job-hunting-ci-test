import{W as a,O as e,d as n,B as c}from"./bridgeCommon-CUNsp_8N.js";const i=o=>{let r=o.data.data;r&&r.from==a&&r.to==e&&(n("[Message][receive]["+r.from+" -> "+r.to+"] message [action="+r.action+",invokeEnv="+r.invokeEnv+",callbackId="+r.callbackId+",error="+r.error+"]"),r.from=e,r.to=c,n("[Message][send]["+r.from+" -> "+r.to+"] message [action="+r.action+",invokeEnv="+r.invokeEnv+",callbackId="+r.callbackId+",error="+r.error+"]"),chrome.runtime.sendMessage(r))},l=(o,r)=>{o&&o.from==c&&o.to==e&&(n("[Message][receive]["+o.from+" -> "+o.to+"] message [action="+o.action+",invokeEnv="+o.invokeEnv+",callbackId="+o.callbackId+",error="+o.error+"]"),o.from=e,o.to=a,n("[Message][send]["+o.from+" -> "+o.to+"] message [action="+o.action+",invokeEnv="+o.invokeEnv+",callbackId="+o.callbackId+",error="+o.error+"]"),r.postMessage(o))},d="/assets/worker-DVlOAtkc.js",t=new Worker(new URL(d,self.location.href),{type:"module"});t.onmessage=function(o){i(o)};chrome.runtime.onMessage.addListener((o,r,k)=>{l(o,t)});
