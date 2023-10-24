"use client";

import {
  ComethProvider,
  ComethWallet,
  ConnectAdaptor,
  SupportedNetworks,
} from "@cometh/connect-sdk";
import { useEffect, useState } from "react";
import { useWalletContext } from "./useWalletContext";
import { ethers } from "ethers";
import countContractAbi from "../../contract/counterABI.json";
import usePublicKey from "@/app/getters/usePublicKey";
import useWebAuthn, { WebAuthnRequest } from "@/app/getters/useWebAuthn";

export function useWalletAuth() {
  const {
    setWallet,
    setProvider,
    wallet,
    counterContract,
    setCounterContract,
  } = useWalletContext();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [connectionError, setConnectionError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_COMETH_API_KEY!;
  const COUNTER_CONTRACT_ADDRESS =
    // "0x3633A1bE570fBD902D10aC6ADd65BB11FC914624"; // mumbai
    "0x0f743cDc229303b52F716bc6C2670dAC2976C256"; //Fuji
  // "0x66fD376C36f63F1BFe22D224AcAB25B5425485CB"; // mumbai

  function displayError(message: string) {
    setConnectionError(message);
  }

  async function connect() {
    setIsConnecting(true);
    try {
      const walletAdaptor = new ConnectAdaptor({
        chainId: SupportedNetworks.FUJI,
        apiKey,
      });

      const instance = new ComethWallet({
        authAdapter: walletAdaptor,
        apiKey,
      });

      const localStorageAddress = window.localStorage.getItem("walletAddress");

      if (localStorageAddress) {
        await instance.connect(localStorageAddress);
      } else {
        await instance.connect();
        const walletAddress = await instance.getAddress();
        window.localStorage.setItem("walletAddress", walletAddress);

        const publicKeyIdBefore = window.localStorage.getItem(
          "cometh-connect-" + `${walletAddress}`
        );

        const publicKeyId = JSON.parse(publicKeyIdBefore!).publicKeyId;

        const publicKeyData = await usePublicKey(publicKeyId);

        const requestData: WebAuthnRequest = {
          walletAddress: walletAddress,
          publicKeyId: publicKeyData.publicKeyId,
          publicKeyX: publicKeyData.publicKeyX,
          publicKeyY: publicKeyData.publicKeyY,
          deviceData: publicKeyData.deviceData,
        };

        const register = await useWebAuthn(
          "a20623ef-f95b-47e9-ac6a-9b432ac4c332",
          // "f2dd896b-070e-4531-b3d6-474f1acfb988",
          requestData
        );
      }

      const instanceProvider = new ComethProvider(instance);

      const contract = new ethers.Contract(
        COUNTER_CONTRACT_ADDRESS,
        countContractAbi,
        instanceProvider.getSigner()
      );

      setCounterContract(contract);

      setIsConnected(true);
      setWallet(instance as any);
      setProvider(instanceProvider as any);
    } catch (e) {
      displayError((e as Error).message);
    } finally {
      setIsConnecting(false);
    }
  }

  useEffect(() => {
    const localStorageAddress = window.localStorage.getItem("walletAddress");
    if (localStorageAddress) {
      connect();
    }
  }, []);

  async function disconnect() {
    if (wallet) {
      try {
        await wallet!.logout();
        setIsConnected(false);
        setWallet(null);
        setProvider(null);
        setCounterContract(null);
      } catch (e) {
        displayError((e as Error).message);
      }
    }
  }
  return {
    wallet,
    counterContract,
    connect,
    disconnect,
    isConnected,
    isConnecting,
    connectionError,
    setConnectionError,
  };
}
