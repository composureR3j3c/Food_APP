import express, { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto/Vandor.dio";
import { Vandor } from "../models/Vandor";
import { GeneratePassword, GenerateSalt } from "../utility/PasswordUtility";
import { DeliveryUser, Transaction } from "../models";

export const Findvandor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vandor.findOne({ email: email });
  } else {
    return await Vandor.findById(id);
  }
};

export const CreateVender = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    pincode,
    foodType,
    email,
    password,
    ownerName,
    phone,
  } = <CreateVandorInput>req.body;

  const existingVander = await Findvandor("", email);

  if (existingVander) {
    res.json({ message: "Vander already exists" });
  }

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const createdVandor = await Vandor.create({
    name: name,
    address: address,
    pincode: pincode,
    foodType: foodType,
    email: email,
    password: userPassword,
    salt: salt,
    ownerName: ownerName,
    phone: phone,
    rating: 0,
    serviceAvailable: false,
    coverImages: [],
    foods: [],
  });

  return res.json(createdVandor);
};

export const GetVenders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vander = await Vandor.find();

  if (vander) {
    return res.json(vander);
  }

  return res.json({ message: "no vanders found!" });
};

export const GetVenderBYID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vanderId = req.params.id;
  const vander = await Findvandor(vanderId);

  if (vander) {
    return res.json(vander);
  }

  return res.status(400).json({ message: "vanders not found!" });
};

export const GetTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transactions = await Transaction.find();

  if (transactions) {
    return res.json(transactions);
  }

  return res.status(400).json({ message: "transactions not found!" });
};

export const GetTransactionsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transactionsId = req.params.id;

  const transactions = await Transaction.findById(transactionsId);

  if (transactions) {
    return res.json(transactions);
  }

  return res.status(400).json({ message: "transactions not found!" });
};

export const VerifyDeliveryUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id, status } = req.body;

  if (_id) {
    const profile = await DeliveryUser.findById(_id);

    if (profile) {
      profile.verified = status;

      const result = await profile.save();

      return res.status(200).json(result);
    }
  }
  return res.status(404).json({ message: "user not found" });
};

export const GetDeliveryUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUsers = await DeliveryUser.find();

  if (deliveryUsers) {
    return res.status(200).json(deliveryUsers);
  }
  return res.status(404).json({ message: "user not found" });
};
