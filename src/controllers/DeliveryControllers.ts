import { VandorLogin } from './VandorControllers';
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import express, { Request, Response, NextFunction } from "express";
import {
  CreateCustomerInput,
  CreateDeliveryUserInput,
  EditCustomerProfileInput,
  OrderInputs,
  UserLoginInput,
  cartItem,
} from "../dto/Customer.dio";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utility";
import { Customer, Food, Offer, Transaction, Vandor } from "../models";
import { GenerateOtp, OnRequestOTP } from "../utility/NotificationUtility";
import { Order } from "../models/Order";
export const DeliveryUserSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUserInputs = plainToClass(CreateDeliveryUserInput, req.body);
  const inputError = await validate(deliveryUserInputs, {
    validationError: { target: true },
  });
  if (inputError.length > 0) {
    return res.status(400).json(inputError);
  }
  const { email, phone, password } = deliveryUserInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const { otp, expiry } = GenerateOtp();
  // console.log("otp",otp, expiry)

  const result = await Customer.create({
    email: email,
    password: userPassword,
    salt: salt,
    firstname: "",
    lastName: "",
    address: "",
    phone: phone,
    verified: false,
    otp: otp,
    otp_expiry: expiry,
    lat: 0,
    lng: 0,
    orders: [],
  });
  if (result) {
    await OnRequestOTP(otp, phone);

    const signature = await GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });

    return res.status(201).json({
      signature: signature,
      verified: result.verified,
      email: result.email,
    });
  }
  return res.status(400).json({ message: "Error wiht sign up" });
};
export const DeliveryUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(UserLoginInput, req.body);
  const loginErrors = await validate(loginInputs, {
    validationError: { target: true },
  });

  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }
  const { email, password } = loginInputs;
  const customer = await Customer.findOne({ email: email });

  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );
    console.log(validation);
    if (validation) {
      const signature = await GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });

      return res.status(201).json({
        signature: signature,
        verified: customer.verified,
        email: customer.email,
      });
    }
  }
  return res.status(400).json({
    message: "Login Error!",
  });
};
export const DeliveryUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      // console.log(profile.otp_expiry, new Date())
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;
      }
      const updatedCustomerResponse = await profile.save();

      const signature = await GenerateSignature({
        _id: updatedCustomerResponse._id,
        email: updatedCustomerResponse.email,
        verified: updatedCustomerResponse.verified,
      });

      return res.status(201).json({
        signature: signature,
        verified: updatedCustomerResponse.verified,
        email: updatedCustomerResponse.email,
      });
    }
  }
  return res.status(400).json({
    verified: "false",
  });
};

export const GetDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);

    return res.status(200).json(profile);
  }
  return res.status(400).json({
    message: "Get profile Error!",
  });
};
export const EditDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  const profileInputs = plainToClass(EditCustomerProfileInput, req.body);
  const profileErrors = await validate(profileInputs, {
    validationError: { target: true },
  });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const { firstName, lastName, address } = profileInputs;
  if (customer) {
    console.log(customer._id);

    const profile = await Customer.findById(customer._id);

    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;

      const result = await profile.save();

      return res.status(200).json(result);
    }
  }
  return res.status(400).json({
    message: "Edit profile Error!",
  });
};
