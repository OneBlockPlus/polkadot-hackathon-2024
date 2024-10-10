'use client'

import CryptoJS from "crypto-js";
import Image from 'next/image';
import QRCode from "qrcode";
import { FC, useEffect, useState } from 'react';
import speakeasy from "speakeasy";

import { Card, CardContent, CardHeader } from '@/components/ui/card';


export const FaCard: FC = () => {
  const [image, setImage] = useState("");
  const [secret, setSecret] = useState("");
  const [validCode, setValidCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(null);
  const [inputValue, setInputValue] = useState("");
  useEffect(() => {
    const secret = {
      ascii: "?:SD%oDD<E!^q^1N):??&QkeqRkhkpt&",
      base32: "H45FGRBFN5CEIPCFEFPHCXRRJYUTUPZ7EZIWWZLRKJVWQ23QOQTA",
      hex: "3f3a5344256f44443c45215e715e314e293a3f3f26516b6571526b686b707426",
      otpauth_url:
        "otpauth://totp/Adidas%Adidas?secret=H45FGRBFN5CEIPCFEFPHCXRRJYUTUPZ7EZIWWZLRKJVWQ23QOQTA"
    };

    const backupCodes = [];
    const hashedBackupCodes = [];

    for (let i = 0; i < 10; i++) {
      const randomCode = (Math.random() * 10000000000).toFixed();
      const encrypted = CryptoJS.AES.encrypt(
        randomCode,
        secret.base32
      ).toString();
      backupCodes.push(randomCode);
      hashedBackupCodes.push(encrypted);
    }

    console.log("backupCodes ----->", backupCodes);
    console.log("hashedBackupCodes ----->", hashedBackupCodes);

    QRCode.toDataURL(secret.otpauth_url, (err, imageData) => {
      setImage(imageData);
      setSecret(secret);
    });
  }, []);

  const getCode = () => {
    const { base32, hex } = secret;
    const code = speakeasy.totp({
      secret: hex,
      encoding: "hex",
      algorithm: "sha1"
    });

    setValidCode(code);
  };

  const verifyCode = () => {
    const { base32, hex } = secret;
    const isVerified = speakeasy.totp.verify({
      secret: hex,
      encoding: "hex",
      token: inputValue,
      window: 1
    });

    console.log("isVerified -->", isVerified);
    setIsCodeValid(isVerified);
  };
  return (
    <div className="my-8 flex max-w-[220rem] grow flex-col gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-left text-primary font-sans font-bold text-2xl">2 FA</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-xl text-primary py-4">
              Scan the QR code using Google Authenticator or manually input the setup key
            </div>
            <div className="py-4 text-xl">
              Setup key: Label 5CWNGGH2MGPL5THXGFAMWATV54N7FZMB
            </div>
            <div>
            <Image src={image} width={240} height={240} alt="QR Code" />
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
