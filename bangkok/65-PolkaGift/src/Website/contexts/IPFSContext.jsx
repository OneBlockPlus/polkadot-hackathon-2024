'use client';
import { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import { toast } from 'react-toastify';
import { PinataSDK } from "pinata-web3";


const Gateway = "aqua-dull-locust-679.mypinata.cloud";
const pinata = new PinataSDK({
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwMWMxNGQ1YS0yNTE4LTQ0MGItOTVlMy1jN2ZkMjYyNzZiNGIiLCJlbWFpbCI6Inpha2lyaXN0ZXN0aW5nQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkYmVhZWYyMjNhYzU0NmNlNTRiMSIsInNjb3BlZEtleVNlY3JldCI6Ijk4NWYyZjUxMWEyYTg2YjcyMThmMDBhNDYxODZjMGNhNzRmMzU3MTYzZjFiZWYwMzUzOTI3NDhlNDIyOGY1NTciLCJleHAiOjE3NTUxOTc4OTN9.04_POkYlHazyo7B6bcK1kJ3p1v1BT_DWIi1iERzIzO4",
  pinataGateway: Gateway,
});
const AppContext = createContext({
  UploadBlob: async (file,makeShort = false) => string
});
export async function MakeShortUrl(url) {

  let output = await (await fetch("https://tny.im/yourls-api.php?action=shorturl&url=" + encodeURIComponent(url) + "&format=json&username=zakirhossen&password=zakir%%$", {
    method: "GET",

  })).json();
  return output.shorturl.replace("http",'https');

}
export function IPFSProvider({ children }) {
  function MakeFileUrl(ipfsHash) {
    return "https://" + Gateway + "/ipfs/" + ipfsHash + "?pinataGatewayToken=v8BV9VKQs69NLLcVsQaw_fd_pcihpitKGBGpB13WTx40K9pHydzCcywsW0F1yAeL"
  }
  async function UploadBlob(file,makeShort = false) {
    const upload = await pinata.upload.file(file);
    let url = MakeFileUrl(upload.IpfsHash);
    if (makeShort) {

      return await MakeShortUrl(url);
    }else{
      return url;
    }
  }

  return <AppContext.Provider value={{ UploadBlob }}>{children}</AppContext.Provider>;
}

export const useIPFSContext = () => useContext(AppContext);