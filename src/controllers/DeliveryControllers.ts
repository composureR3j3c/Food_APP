import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import express, { Request, Response, NextFunction } from "express";
import {
  CreateDeliveryUserInput,
  EditCustomerProfileInput,
  UserLoginInput,
} from "../dto/Customer.dio";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utility";
import { Customer, DeliveryUser, Food, Offer, Transaction, Vandor } from "../models";
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
  const { email, phone, password, address, firstName, lastName, pincode } = deliveryUserInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const existDeliveryUser=await DeliveryUser.findOne({email:email});

  if(existDeliveryUser){
    return res.status(409).json({message:"User already exists"})
  }  


  const result = await DeliveryUser.create({
    email: email,
    password: userPassword,
    salt: salt,
    firstname: firstName,
    lastName: lastName,
    address: address,
    phone: phone,
    pincode: pincode,
    verified: false,
    lat: 0,
    lng: 0,
    isAvailable: false
  });
  if (result) {

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
  const deliveryUser = await DeliveryUser.findOne({ email: email });

  if (deliveryUser) {
    const validation = await ValidatePassword(
      password,
      deliveryUser.password,
      deliveryUser.salt
    );
    console.log(validation);
    if (validation) {
      const signature = await GenerateSignature({
        _id: deliveryUser._id,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });

      return res.status(201).json({
        signature: signature,
        verified: deliveryUser.verified,
        email: deliveryUser.email,
      });
    }
  }
  return res.status(400).json({
    message: "Login Error!",
  });
};

export const UpdateDeliveryUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const deliveryUser = req.user;
  if (deliveryUser) {

    const { lat, lng } = req.body;

    const profile = await DeliveryUser.findById(deliveryUser._id);


    if (profile) {

      if (lat&&lng) {
        profile.lat=lat;
        profile.lng=lng;
      }        

      profile.isAvailable=!profile.isAvailable;
      const result= await profile.save();

      return res.status(200).json(result);
    }
  }
  return res.status(400).json({
    message: "Update status Error!",
  });
};

export const GetDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await DeliveryUser.findById(customer._id);

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
  const deliveryUser = req.user;
  const profileInputs = plainToClass(EditCustomerProfileInput, req.body);
  const profileErrors = await validate(profileInputs, {
    validationError: { target: true },
  });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const { firstName, lastName, address } = profileInputs;
  if (deliveryUser) {
    console.log(deliveryUser._id);

    const profile = await DeliveryUser.findById(deliveryUser._id);

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


