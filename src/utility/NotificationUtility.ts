import { TW_SID, TW_TOKEN } from "../config";

export const GenerateOtp = () => {
  let otp = Math.floor(10000 + Math.random() * 90000);
  console.log("otp", otp);
  let expiry = new Date();

  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const OnRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const accoutSid = TW_SID;
  const authToken = TW_TOKEN;
  const client = require("twilio")(accoutSid, authToken);
  console.log("otp", otp);
  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: "+18039321034",
    to: toPhoneNumber,
  });

  // console.log(response);
  return response;
};
