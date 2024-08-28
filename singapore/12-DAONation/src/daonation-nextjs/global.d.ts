declare global {
  interface Window {
    userid: string;
    signerAddress: string;
    injectedWeb3: any;
    editorGJ: any;
  }
}
export {};
