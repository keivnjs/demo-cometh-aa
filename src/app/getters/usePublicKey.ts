const axios = require("axios");

const apiKey = process.env.NEXT_PUBLIC_COMETH_API_KEY;
// const localStorageAddress = window.localStorage.getItem("walletAddress");
// const publicKeyIdBefore = window.localStorage.getItem(
//   "cometh-connect-" + `${localStorageAddress}`
// );
// const publicKeyId = JSON.parse(publicKeyIdBefore!).publicKeyId;

export interface Response {
  publicKeyId: string;
  publicKeyX: string;
  publicKeyY: string;
  deviceData: object;
}

export default async function usePublicKey(publicKeyId: string): Promise<any> {
  const apiUrl = `https://api.connect.cometh.io/webauthn-signer/public-key-id/${publicKeyId}`;

  const headers = {
    apikey: apiKey,
  };

  return axios
    .get(apiUrl, { headers })
    .then(function (res: any) {
      let response: Response = {
        publicKeyId: res.data.webAuthnSigner.publicKeyId,
        publicKeyX: res.data.webAuthnSigner.publicKeyX,
        publicKeyY: res.data.webAuthnSigner.publicKeyY,
        deviceData: res.data.webAuthnSigner.deviceData,
      };

      return response;
    })
    .catch(function (error: string) {
      console.error("API Error:", error);
    });
}
