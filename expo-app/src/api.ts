import {parseOAuthCode} from './oauth-code';
import * as SecureStore from "expo-secure-store";
export const API = "https://hardware-garden-rahul.rahulrameshm98.chatgpt.site";
export const WEB = "https://hardware-garden.vercel.app";
let token = "";
export async function restoreToken() {
  token = (await SecureStore.getItemAsync("hg-native-session")) || "";
}
export async function clearToken() {
  token = "";
  await SecureStore.deleteItemAsync("hg-native-session");
}
export async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Origin", "http://localhost");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const r = await fetch(API + path, { ...init, headers });
  const signed = r.headers.get("set-auth-token");
  if (signed) {
    token = signed;
    await SecureStore.setItemAsync("hg-native-session", signed);
  }
  return r;
}
export async function jsonApi(
  path: string,
  body?: unknown,
  extra: Record<string, string> = {},
) {
  const r = await api(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", ...extra },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await r.json();
  if (!r.ok)
    throw Error(
      data.error?.message ||
        data.error ||
        data.message ||
        "Could not connect. Try again.",
    );
  return data;
}

export async function saveOAuthProof(state: string, verifier: string) {
  await SecureStore.setItemAsync(
    "hg-oauth-proof",
    JSON.stringify({ state, verifier }),
  );
}
let exchanging: Promise<boolean> | null = null;
export function finishOAuth(value: string): Promise<boolean> {
  if (exchanging) return exchanging;
  exchanging = (async () => {
    const parsed=parseOAuthCode(value);if(!parsed)return false;const {state,token}=parsed;
    const saved = JSON.parse(
      (await SecureStore.getItemAsync("hg-oauth-proof")) || "null",
    );
    if (!saved || saved.state !== state)
      throw Error("Sign-in response did not match. Start again.");
    await jsonApi("/api/mobile/exchange", { token, verifier: saved.verifier });
    await SecureStore.deleteItemAsync("hg-oauth-proof");
    return true;
  })().finally(() => {
    exchanging = null;
  });
  return exchanging;
}
