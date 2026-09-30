import test from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {server} from "../server.mjs";

test("Node server serves health, exact static routes, APIs, and safe 404 responses",async()=>{
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const {port}=server.address(),origin=`http://127.0.0.1:${port}`;
 try{
  let response=await fetch(`${origin}/healthz`);assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true});assert.equal(response.headers.get("cache-control"),"no-store");
  response=await fetch(`${origin}/`);assert.equal(response.status,200);assert.match(response.headers.get("content-type"),/^text\/html/);assert.equal(response.headers.get("cache-control"),"no-cache");assert.match(await response.text(),/오름인터내셔널/);
  response=await fetch(`${origin}/brands/biostar/`);assert.equal(response.status,200);assert.match(await response.text(),/BIOstar/);
  response=await fetch(`${origin}/assets/css/style.css`);assert.equal(response.status,200);assert.match(response.headers.get("content-type"),/^text\/css/);assert.match(response.headers.get("cache-control"),/^public/);
  response=await fetch(`${origin}/route-that-does-not-exist`);assert.equal(response.status,404);
  response=await fetch(`${origin}/api/ai-clean-care`);assert.equal(response.status,405);
  response=await fetch(`${origin}/api/admin/ai/status`);assert.equal(response.status,200);assert.equal(typeof (await response.json()).adminPinConfigured,"boolean");
 }finally{server.close();await once(server,"close")}
});
