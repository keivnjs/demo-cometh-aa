import axios from "axios";

export interface WebAuthnRequest {
  walletAddress: string;
  publicKeyId: string;
  publicKeyX: string;
  publicKeyY: string;
  deviceData: {
    browser: string;
    os: string;
    platform: string;
  };
}

export default async function useWebAuthn(
  apiKey: string,
  requestData: WebAuthnRequest
) {
  try {
    const apiUrl = "https://api.connect.cometh.io/wallets/init-with-webauthn";

    const headers = {
      apikey: apiKey,
    };

    const response = await axios.post(apiUrl, requestData, { headers });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("WebAuthn API request failed");
    }
  } catch (error) {
    throw error;
  }
}
