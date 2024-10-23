import Browser from "webextension-polyfill";
import { setupMessagesProxy } from "./messages-proxy";
// @ts-ignore
import dappInterface from "@/dapp-interface?script&module";

console.log("Content script loaded");

console.log("Injecting dapp interface");
const script = document.createElement("script");
script.async = false;
script.setAttribute("src", Browser.runtime.getURL(dappInterface));
script.type = "module";
const container = document.head || document.documentElement;
container.insertBefore(script, container.firstElementChild);
container.removeChild(script);
setupMessagesProxy();
