"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnRequestOTP = exports.GenerateOtp = void 0;
const config_1 = require("../config");
const GenerateOtp = () => {
    let otp = Math.floor(10000 + Math.random() * 90000);
    console.log("otp", otp);
    let expiry = new Date();
    expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
    return { otp, expiry };
};
exports.GenerateOtp = GenerateOtp;
const OnRequestOTP = (otp, toPhoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const accoutSid = config_1.TW_SID;
    const authToken = config_1.TW_TOKEN;
    const client = require("twilio")(accoutSid, authToken);
    console.log("otp", otp);
    const response = yield client.messages.create({
        body: `Your OTP is ${otp}`,
        from: "+18039321034",
        to: toPhoneNumber,
    });
    // console.log(response);
    return response;
});
exports.OnRequestOTP = OnRequestOTP;
