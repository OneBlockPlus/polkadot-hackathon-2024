import MESSAGES from "./messsages";

export default async function getReqBody(req: Request) {
  try {
    return await req.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error || MESSAGES.REQ_BODY_ERROR, 500);
    return {};
  }
}
