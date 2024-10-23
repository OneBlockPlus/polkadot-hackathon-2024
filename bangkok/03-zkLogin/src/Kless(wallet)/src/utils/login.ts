import Browser from "webextension-polyfill";

import { randomBytes } from "@noble/hashes/utils";
import { base64url } from "jose";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const CLIENT_ID =
  "560629365517-gpq20ncqkm117aj318f1q6kjn5sgh2d5.apps.googleusercontent.com";

export async function tryGetRedirectURLSilently(authUrl: string) {
  try {
    console.log('tryGetRedirectURLSilently', authUrl);
    const responseText = await (await fetch(authUrl)).text();
    const redirectURLMatch =
      /<meta\s*http-equiv="refresh"\s*(CONTENT|content)=["']0;\s?URL='(.*)'["']\s*\/?>/.exec(
        responseText
      );
    console.log(redirectURLMatch)
    if (redirectURLMatch) {
      const redirectURL = redirectURLMatch[2];
      if (
        redirectURL.startsWith(
          `https://${Browser.runtime.id}.chromiumapp.org`
        ) &&
        redirectURL.includes("id_token=")
      ) {
        return new URL(redirectURL.replaceAll("&amp;", "&"));
      }
    }
  } catch (e) {
    console.log('error', e);
    //do nothing
  }
  return null;
}

export async function zkLoginAuthenticate({
  nonce,
  prompt,
  sub,
}: {
  nonce?: string;
  sub?: string;
  prompt?: boolean;
}) {
  if (!nonce) {
    nonce = base64url.encode(randomBytes(20));
  }

  const params = new URLSearchParams({
    response_type: "id_token",
    scope: "openid email",
  });
  params.append("client_id", CLIENT_ID);
  params.append("redirect_uri", Browser.identity.getRedirectURL());
  params.append("nonce", nonce);
  if (sub) {
    params.append("login_hint", sub);
  }
  if (prompt) {
    params.append("prompt", "select_account");
  }
  const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  let responseURL;
  if (!prompt) {
    responseURL = await tryGetRedirectURLSilently(authUrl);
  }
  console.log('responseURL', authUrl);
  if (!responseURL) {
    responseURL = new URL(
      await Browser.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true,
      })
    );
  }

  const responseParams = new URLSearchParams(responseURL.hash.replace("#", ""));
  const jwt = responseParams.get("id_token");
  if (!jwt) {
    throw new Error("JWT is missing");
  }
  return jwt;
}
