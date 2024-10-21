import * as log from "https://deno.land/std/log/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import {loadSync as loadEnvSync} from "https://deno.land/std/dotenv/mod.ts";
import {crypto} from "https://deno.land/std/crypto/mod.ts"
import {encodeHex} from "https://deno.land/std/encoding/hex.ts"
import {decodeBase64} from 'https://deno.land/std/encoding/base64.ts';

import {createCanvas, loadImage as loadImageForCanvas} from "https://deno.land/x/canvas/mod.ts";

// import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";
// import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";
import * as Minio from "npm:minio";

import type {HexString} from "https://deno.land/x/polkadot/util/types.ts";
import type {Keypair} from "https://deno.land/x/polkadot/util-crypto/types.ts";
import {u8aToString, hexToString, hexToU8a, stringToHex, u8aToHex} from "https://deno.land/x/polkadot/util/mod.ts";
import {cryptoWaitReady, ed25519PairFromSeed} from "https://deno.land/x/polkadot/util-crypto/mod.ts";
import {encryptMessage, decryptMessage} from "./message_utils.ts"

const specVersion = 1;

const workPath = path.dirname(path.fromFileUrl(import.meta.url));
const isProd = Deno.env.get("DEBUG") !== "1";
const env = loadEnvSync();

let s3Client;
if (env.FALLBACK_S3_ENABLED.toString() == "1") {
  // s3Client = new S3Client({
  //   credentials: {
  //     secretAccessKey: env.FALLBACK_S3_SECRET_ACCESS_KEY,
  //     accessKeyId: env.FALLBACK_S3_ACCESS_KEY_ID,
  //   },
  //   endpoint: env.FALLBACK_S3_ENDPOINT,
  //   tls: env.FALLBACK_S3_USE_SSL.toString() === "1",
  //   forcePathStyle: env.FALLBACK_S3_FORCE_PATH_STYLE.toString() === "1",
  //   region: env.FALLBACK_S3_REGION,
  // });

  s3Client = new Minio.Client({
    endPoint: env.FALLBACK_S3_ENDPOINT,
    useSSL: env.FALLBACK_S3_USE_SSL.toString() === "1",
    accessKey: env.FALLBACK_S3_ACCESS_KEY_ID,
    secretKey: env.FALLBACK_S3_SECRET_ACCESS_KEY,
  })
}

enum Result {
  Success = "Success",
  Fail = "Fail",
  Error = "Error",
  Panic = "Panic",
}

function renderResult(encode: boolean, result: Result, data?: unknown) {
  const output = JSON.stringify({
    specVersion,
    result,
    e2e: false,
    data: data ?? null,
  });
  console.log(encode ? stringToHex(output) : output);
}

function renderResultWithE2E(
  encode: boolean,
  e2eKeyPair: Keypair,
  recipientPublicKey: HexString | string | Uint8Array,
  result: Result,
  data?: unknown
) {
  const output = JSON.stringify({
    specVersion,
    result,
    e2e: true,
    senderPublicKey: u8aToHex(e2eKeyPair.publicKey),
    encryptedData: data ? u8aToHex(encryptMessage(JSON.stringify(data), e2eKeyPair.secretKey, recipientPublicKey)) : null,
  });
  console.log(encode ? stringToHex(output) : output);
}

function renderPanic(encode: boolean, code: string) {
  const output = JSON.stringify({
    result: Result.Panic,
    code,
  });
  console.log(encode ? stringToHex(output) : output);
}

// Stdout will be the output that submit to chain, we could use log for debugging
async function initializeLogger(logFilename: string) {
  // logger not write to log instantly, need explict call `logger.handlers[0].flush()`
  await log.setup({
    handlers: {
      console: new log.handlers.ConsoleHandler("NOTSET"),
      file: new log.handlers.FileHandler("NOTSET", {
        filename: logFilename,
        formatter: (rec) =>
          JSON.stringify(
            { ts: rec.datetime, topic: rec.loggerName, level: rec.levelName, msg: rec.msg },
          ),
      }),
    },
    loggers: {
      default: {
        level: "NOTSET",
        handlers: isProd ? ["file"] : ["console"],
      },
    },
  });
}

await cryptoWaitReady().catch((e) => {
  console.error(e.message);

  renderPanic(isProd, "INIT_CRYPTO_FAIL");
  Deno.exit(1);
});

await initializeLogger(path.resolve(path.join(workPath, "run.log"))).catch((e) => {
  console.error(e.message);

  renderPanic(isProd, "INIT_LOGGER_FAIL");
  Deno.exit(1);
});
const logger = log.getLogger("default");

const e2eKeyPair = function () {
  try {
    return ed25519PairFromSeed(hexToU8a(env.E2E_KEY_SEED));
  } catch (e) {
    logger.error(JSON.stringify(e));

    renderPanic(isProd, "LOAD_E2E_KEYPAIR_FAIL");
    Deno.exit(1);
  }
}()

const input = (Deno.args[0] ?? "").toString().trim();
const parsedInput = function (input) {
  if (input.length === 0) {
    renderResult(isProd, Result.Error, "INPUT_IS_BLANK");
    Deno.exit(1);
  }

  try {
    return JSON.parse(hexToString(input));
  } catch (e) {
    logger.error(JSON.stringify(e));

    renderResult(isProd, Result.Error, "INPUT_CANT_PARSE");
    Deno.exit(1);
  }
}(input);
const parsedData = function (input, keyPair) {
  try {
    const e2eRequired = input.e2e ?? false;
    if (!e2eRequired) {
      return input.data ?? null;
    }

    return JSON.parse(
      u8aToString(
        decryptMessage(hexToU8a(input.encryptedData), keyPair.secretKey, input.senderPublicKey)
      )
    );
  } catch (e) {
    logger.error(JSON.stringify(e));

    renderResult(isProd, Result.Error, "ENCRYPTED_ARGS_CANT_DECRYPT");
    Deno.exit(1);
  }
}(parsedInput, e2eKeyPair);

const renderAndExit = function (result: Result, data: unknown) {
  if (parsedInput.e2e) {
    renderResultWithE2E(isProd, e2eKeyPair, parsedInput.senderPublicKey, result, data);
  } else {
    renderResult(isProd, result, data);
  }
  Deno.exit(result == Result.Success ? 0 : 1);
}

// Main stage

if (!isProd) {
    logger.debug(parsedData)
}

if (parsedInput["v"] != 1) {
  renderAndExit(Result.Error, "VERSION_INCOMPATIBLE");
}

let imageUploadUrl = parsedData["image_upload_url"] ? parsedData["image_upload_url"].toString().trim() : "";
if (imageUploadUrl.length === 0 && !s3Client) {
  renderAndExit(Result.Error, "IMAGE_UPLOAD_URL_IS_BLANK");
}
let proofUploadUrl = parsedData["proof_upload_url"] ? parsedData["proof_upload_url"].toString().trim() : "";
if (proofUploadUrl.length === 0 && !s3Client) {
  renderAndExit(Result.Error, "PROOF_UPLOAD_URL_IS_BLANK");
}

const prompt = parsedData["prompt"] ? parsedData["prompt"].toString().trim() : "";
if (prompt.length === 0) {
  renderAndExit(Result.Error, "PROMPT_IS_BLANK");
}
const negativePrompt = parsedData["negative_prompt"] ? parsedData["negative_prompt"].toString().trim() : "";
const cfgScale = parsedData["cfg_scale"] ? Number(parsedData["cfg_scale"]) : 7;
if (parsedData["cfg_scale"] && cfgScale.toString() !== parsedData["cfg_scale"].toString()) {
  renderAndExit(Result.Error, "CFG_SCALE_INVALID");
} else if (cfgScale < 1) {
  renderAndExit(Result.Error, "CFG_SCALE_SMALLER_THAN_ONE");
}
const seed = parsedData["seed"] ? parseInt(parsedData["seed"].toString()) : Math.floor(Math.random() * 10000);
if (parsedData["seed"] && seed.toString() !== parsedData["seed"].toString()) {
  renderAndExit(Result.Error, "SEED_NOT_INTEGER");
}
const steps = parsedData["steps"] ? parseInt(parsedData["steps"].toString()) : 20;
if (parsedData["steps"] && steps.toString() !== parsedData["steps"].toString()) {
  renderAndExit(Result.Error, "STEPS_NOT_INTEGER");
} else if (steps < 1) {
  renderAndExit(Result.Error, "STEPS_TOO_SMALL");
} else if (steps > 150) {
  renderAndExit(Result.Error, "STEPS_TOO_LARGE");
}
const width = parsedData["width"] ? parseInt(parsedData["width"].toString()) : 512;
if (parsedData["width"] && width.toString() !== parsedData["width"].toString()) {
  renderAndExit(Result.Error, "WIDTH_NOT_INTEGER");
} else if (width < 128) {
  renderAndExit(Result.Error, "WIDTH_TOO_SMALL");
} else if (width > 2048) {
  renderAndExit(Result.Error, "WIDTH_TOO_LARGE");
}
const height = parsedData["height"] ? parseInt(parsedData["height"].toString()) : 512;
if (parsedData["height"] && height.toString() !== parsedData["height"].toString()) {
  renderAndExit(Result.Error, "HEIGHT_NOT_INTEGER");
} else if (height < 128) {
  renderAndExit(Result.Error, "HEIGHT_TOO_SMALL");
} else if (height > 2048) {
  renderAndExit(Result.Error, "HEIGHT_TOO_LARGE");
}
const clipSkip = parsedData["clip_skip"] ? parseInt(parsedData["clip_skip"].toString()): 1;
if (parsedData["clip_skip"] && clipSkip.toString() !== parsedData["clip_skip"].toString()) {
  renderAndExit(Result.Error, "CLIP_SKIP_NOT_INTEGER");
} else if (clipSkip < 1) {
  renderAndExit(Result.Error, "CLIP_SKIP_TOO_SMALL");
} else if (clipSkip > 12) {
  renderAndExit(Result.Error, "CLIP_SKIP_TOO_LARGE");
}
const etaNoiseSeedDelta = parsedData["ensd"] ? parseInt(parsedData["ensd"].toString()) : 0;
if (parsedData["ensd"] && etaNoiseSeedDelta.toString() !== parsedData["ensd"].toString()) {
  renderAndExit(Result.Error, "ENSD_NOT_INTEGER");
}
const restoreFaces = parsedData["restore_faces"] ?? false;
const tiling = parsedData["tiling"] ?? false;

const enableHr = parsedData["hr_fix"] ?? false;
const hrUpscaler = parsedData["hr_fix_upscaler_name"] ?? "None";
const hrDenoisingStrength = parsedData["hr_fix_denoising"] ? Number(parsedData["hr_fix_denoising"]) : 0.7;
if (enableHr) {
  if (parsedData["hr_fix_denoising"] && hrDenoisingStrength.toString() !== parsedData["hr_fix_denoising"].toString()) {
    renderAndExit(Result.Error, "DENOISING_STRENGTH_INVALID");
  } else if (hrDenoisingStrength < 0) {
    renderAndExit(Result.Error, "DENOISING_STRENGTH_TOO_SMALL");
  } else if (hrDenoisingStrength > 1) {
    renderAndExit(Result.Error, "DENOISING_STRENGTH_TOO_LARGE");
  }
}
const hrUpscale = parsedData["hr_fix_upscale"] ? Number(parsedData["hr_fix_upscale"]) : 2;
if (enableHr) {
  if (parsedData["hr_fix_upscale"] && hrUpscale.toString() !== parsedData["hr_fix_upscale"].toString()) {
    renderAndExit(Result.Error, "HR_SCALE_INVALID");
  } else if (hrUpscale < 1) {
    renderAndExit(Result.Error, "HR_SCALE_TOO_SMALL");
  } else if (hrUpscale > 4) {
    renderAndExit(Result.Error, "HR_SCALE_TOO_LARGE");
  }
}
const hrSecondPassSteps = parsedData["hr_fix_steps"] ? parseInt(parsedData["hr_fix_steps"].toString()) : 20;
if (hrSecondPassSteps) {
  if (parsedData["hr_fix_steps"] && hrSecondPassSteps.toString() !== parsedData["hr_fix_steps"].toString()) {
    renderAndExit(Result.Error, "HR_SECOND_PASS_STEPS_NOT_INTEGER");
  } else if (hrSecondPassSteps < 1) {
    renderAndExit(Result.Error, "HR_SECOND_PASS_STEPS_TOO_SMALL");
  } else if (hrSecondPassSteps > 150) {
    renderAndExit(Result.Error, "HR_SECOND_PASS_STEPS_TOO_LARGE");
  }
}

const modelName = parsedData["sd_model_name"] ?? "v1-5-pruned-emaonly";
const samplerName = parsedData["sampler_name"] ?? "LMS";

let modelTitle: string | null = null;
let samplerTitle: string | null = null;

// Check model
try {
  const resp = await fetch(`${env.SD_API_BASE}/sd-models`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const models = await resp.json();

  for (const item of models) {
    if (item["name"] == modelName || item["model_name"] == modelName) {
      modelTitle = item.title
      break;
    }
  }

  if (!modelTitle) {
    logger.error(`Model "${modelName}" not found`);
    renderAndExit(Result.Error, "MODEL_NOT_FOUND");
  }
} catch (e) {
  logger.error(JSON.stringify(e));
  renderAndExit(Result.Error, "SD_API_ERROR");
}

// Check sampler
try {
  const resp = await fetch(`${env.SD_API_BASE}/samplers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const samplers = await resp.json();

  for (const item of samplers) {
    if (item["name"] == samplerName || item["aliases"].includes(samplerName)) {
      samplerTitle = item.name;
      break;
    }
  }

  if (!samplerTitle) {
    logger.error(`Sampler "${samplerName}" not found`);
    renderAndExit(Result.Error, "SAMPLER_NOT_FOUND");
  }
} catch (e) {
  logger.error(JSON.stringify(e));
  renderAndExit(Result.Error, "SD_API_ERROR");
}

// // Switch model and model level configurations
// try {
//   const _resp = await fetch(`${env.SD_API_BASE}/options`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       "sd_model_checkpoint": modelTitle,
//       "CLIP_stop_at_last_layers": clipSkip,
//       "eta_noise_seed_delta": etaNoiseSeedDelta,
//     }),
//   });
// } catch (e) {
//   logger.error(JSON.stringify(e));
//   renderAndExit(Result.Error, "SD_API_ERROR");
// }

// Call txt2img
let image: Uint8Array;
let responsePayload: string;
try {
  const requestPayload: {
    "override_settings": unknown,
    "override_settings_restore_afterwards": boolean,
    "prompt": string,
    "negative_prompt"?: string,
    "sampler_name": string,
    "cfg_scale": number,
    "seed": number,
    "steps": number,
    "width": number,
    "height": number
    "restore_faces": boolean,
    "tiling": boolean,
    "enable_hr": boolean,
    "hr_scale": number,
    "hr_upscaler": string,
    "hr_second_pass_steps": string,
    "denoising_strength": number,
  } = {
    override_settings: {
      "sd_model_checkpoint": modelTitle,
      "CLIP_stop_at_last_layers": clipSkip,
      "eta_noise_seed_delta": etaNoiseSeedDelta,
    },
    override_settings_restore_afterwards: true,
    prompt,
    negative_prompt: negativePrompt.length > 0 ? negativePrompt : undefined,
    sampler_name: samplerTitle,
    cfg_scale: cfgScale,
    seed,
    steps,
    width,
    height,
    restore_faces: restoreFaces,
    tiling,
    enable_hr: enableHr,
  };

  if (enableHr) {
    Object.assign(requestPayload, {
      hr_scale: hrUpscale,
      hr_upscaler: hrUpscaler,
      hr_second_pass_steps: hrSecondPassSteps,
      denoising_strength: hrDenoisingStrength,
    });
  }

  if (!isProd) {
    logger.debug(requestPayload)
  }

  const resp = await fetch(`${env.SD_API_BASE}/txt2img`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestPayload),
  });
  responsePayload = await resp.text();
  if (!isProd) {
    logger.debug(responsePayload)
  }
  const parsedResponsePayload = JSON.parse(responsePayload);
  if (parsedResponsePayload.error) {
    renderAndExit(Result.Error, "SD_API_ERROR_OR_BAD_PROMPT");
  }
  image = decodeBase64(parsedResponsePayload.images[0]);
} catch (e) {
  logger.error(JSON.stringify(e, Object.getOwnPropertyNames(e)));
  renderAndExit(Result.Error, "SD_API_ERROR");
}

// Test image, sometimes the image will full black
function isCanvasBlank(canvas) {
  const context = canvas.getContext('2d');

  const pixelBuffer = new Uint32Array(
    context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );

  return !pixelBuffer.some(color => color !== 0 && color !== 4278190080);
}

try {
  const canvas = createCanvas(width, height);
  const canvasCtx = canvas.getContext("2d");
  canvasCtx.drawImage(await loadImageForCanvas(image), 0, 0);

  if (isCanvasBlank(canvas)) {
    renderAndExit(Result.Fail, "IMAGE_VERIFY_FAILED");
  }
} catch (e) {
  logger.error(JSON.stringify(e, Object.getOwnPropertyNames(e)));
  renderPanic(isProd, "UNABLE_VERIFY_IMAGE");
  Deno.exit(1);
}

if (!isProd) {
  logger.debug("Uploading image")
}

// Upload image
const imageHash = encodeHex(await crypto.subtle.digest("BLAKE2S", new TextEncoder().encode(image)));
if (imageUploadUrl.length === 0 && s3Client) {
  // imageUploadUrl = await getSignedUrl(
  //   s3Client,
  //   new PutObjectCommand({
  //     Bucket: env.FALLBACK_S3_BUCKET,
  //     Key: `${imageHash}.png`,
  //   }),
  //   { expiresIn: 60 }
  // )
  imageUploadUrl = await s3Client.presignedPutObject(env.FALLBACK_S3_BUCKET, `${imageHash}.png`, 60);
}
const imageUploadResp = await fetch(imageUploadUrl, {
  method: 'PUT',
  body: image
})
if (!imageUploadResp.ok) {
  logger.error(await imageUploadResp.text());
  renderAndExit(Result.Error, "IMAGE_UPLOAD_ERROR");
}

if (!isProd) {
  logger.debug("Uploading proof")
}

// Upload proof
const proofHash = encodeHex(await crypto.subtle.digest("BLAKE2S", new TextEncoder().encode(responsePayload)));
if (proofUploadUrl.length === 0 && s3Client) {
  // proofUploadUrl = await getSignedUrl(
  //   s3Client,
  //   new PutObjectCommand({
  //     Bucket: env.FALLBACK_S3_BUCKET,
  //     Key: `${imageHash}.json`,
  //   }),
  //   { expiresIn: 60 }
  // )
  proofUploadUrl = await s3Client.presignedPutObject(env.FALLBACK_S3_BUCKET, `${imageHash}.json`, 60);
}
const proofUploadResp = await fetch(proofUploadUrl, {
  method: 'PUT',
  body: new TextEncoder().encode(responsePayload)
})
if (!proofUploadResp.ok) {
  logger.error(await proofUploadResp.text());
  renderAndExit(Result.Error, "PROOF_UPLOAD_ERROR");
}

let imageUrl = new URL(imageUploadUrl);
imageUrl.search = ""
let proofUrl = new URL(proofUploadUrl);
proofUrl.search = ""

if (!isProd) {
  logger.debug("Finished")
}

renderAndExit(Result.Success, {
  imageUrl,
  imageHash,
  proofUrl,
  proofHash,
});
