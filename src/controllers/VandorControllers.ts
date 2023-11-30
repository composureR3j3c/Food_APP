import express, { Request, Response, NextFunction } from "express";
import { CreateOfferrInput, EditVandorInput, VandorLoginInputs } from "../dto";
import { Findvandor } from "./AdminControllers";
import {
  GeneratePassword,
  GenerateSignature,
  ValidatePassword,
} from "../utility";
import { Vandor } from "../models/Vandor";
import { CreateFoodInput } from "../dto/Food.dto";
import { Food, Offer } from "../models";
import { Order } from "../models/Order";
export const VandorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VandorLoginInputs>req.body;
  const existingVandor = await Findvandor("", email);
  if (existingVandor !== null) {
    const validation = await ValidatePassword(
      password,
      existingVandor.password,
      existingVandor.salt
    );
    if (validation) {
      const signature = await GenerateSignature({
        _id: existingVandor._id,
        email: existingVandor.email,
        name: existingVandor.name,
        foodTypes: existingVandor.foodType,
      });
      return res.json(signature);
    } else {
      return res.json({ message: "Password is not valid!" });
    }
  }
  return res.json({ message: "Login credentials not valid!" });
};

export const GetVandorprofile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  const existingVander = await Findvandor(user?._id);

  if (user) {
    return res.json(existingVander);
  }

  return res.status(400).json({ message: "vanders not found!" });
};
export const UpdateVandorprofile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { address, foodType, name, phone } = <EditVandorInput>req.body;
  const user = req.user;

  const existingVander = await Findvandor(user?._id);

  if (user) {
    if (existingVander) {
      existingVander.name = name;
      existingVander.phone = phone;
      existingVander.foodType = foodType;
      existingVander.address = address;

      const savedResult = await existingVander.save();

      return res.json(savedResult);
    }

    return res.json(existingVander);
  }

  return res.status(400).json({ message: "vanders not found!" });
};
export const UpdateVandorCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  const existingVander = await Findvandor(user?._id);

  if (user) {
    if (existingVander) {
      const files = req.files as [Express.Multer.File];

      const images = files.map((file: Express.Multer.File) => file.filename);

      existingVander.coverImages.push(...images);

      const savedResult = await existingVander.save();

      return res.json(savedResult);
    }

    return res.json(existingVander);
  }

  return res.status(400).json({ message: "vanders not found!" });
};
export const UpdateVandorservice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const {lat,lng}=req.body;


  const existingVander = await Findvandor(user?._id);

  if (user) {
    if (existingVander) { 
      existingVander.serviceAvailable = !existingVander.serviceAvailable;

      if(lat&&lng){
        existingVander.lat=lat;
        existingVander.lng=lng;
      }
      const savedResult = await existingVander.save();

      return res.json(savedResult);
    }

    return res.json(existingVander);
  }

  return res.status(400).json({ message: "vanders not found!" });
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const { category, description, foodType, name, price, readyTime } = <
      CreateFoodInput
    >req.body;

    const vandor = await Findvandor(user._id);

    if (vandor) {
      const files = req.files as [Express.Multer.File];

      const images = files.map((file: Express.Multer.File) => file.filename);
      const createdFood = await Food.create({
        vandorid: vandor._id,
        category: category,
        description: description,
        foodType: foodType,
        name: name,
        price: price,
        readyTime: readyTime,
        images: images,
        ratings: 0,
      });

      vandor.foods.push(createdFood);
      const result = await vandor.save();

      return res.json(result);
    }
  }

  return res.status(400).json({ message: "vanders not found!" });
};

export const GetFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  // const existingVander = await Findvandor(user?._id);

  if (user) {
    const food = await Food.find();

    if (food) {
      return res.json(food);
    }

    return res.json({ message: "no Foods found!" });
  }

  return res.status(400).json({ message: "vanders not found!" });
};

export const GetCurrentOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const orders = await Order.find({ vandorId: user._id }).populate(
      "items.food"
    );
    if (orders != null) {
      return res.status(200).json(orders);
    }
  }
  return res.status(404).json({ message: "No order found" });
};

export const GetOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");
    if (order != null) {
      return res.status(200).json(order);
    }
  }
  return res.status(404).json({ message: "No order found" });
};

export const ProcessOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;
  const { status, remarks, time } = req.body;
  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food", {
      strictPopulate: false,
    });

    order.orderStatus = status;
    order.remarks = remarks;
    if (time) {
      order.readyTime = time;
    }
    const orderResult = await order.save();
    if (orderResult != null) {
      return res.status(200).json(orderResult);
    }
  }
  return res.json({ message: "Unable to process order!" });
};

export const GetOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    let currentOffers = Array();
    const offers = await Offer.find().populate("vandors", {
      strictPopulate: false,
    });
    if (offers) {
      offers.map((item) => {
        if (item.vandors) {
          item.vandors.map((vendor) => {
            if (vendor._id.toString() === user._id) {
              currentOffers.push(item);
            }
          });
        }
        if (item.offerType === "GENERIC") currentOffers.push(item);
      });
    }
    return res.json(currentOffers);
  }
  return res.json({"message":"Offers not available!"})
};
export const AddOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const {
      title,
      description,
      offerType,
      offerAmount,
      pincode,
      promocode,
      promoType,
      startValidity,
      endValidity,
      bank,
      bins,
      isActive,
      minValues,
      vandors,
    } = <CreateOfferrInput>req.body;

    const vendor = await Findvandor(user._id);

    if (vendor) {
      const offer = await Offer.create({
        title,
        description,
        offerType,
        offerAmount,
        pincode,
        promocode,
        promoType,
        startValidity,
        endValidity,
        bank,
        bins,
        isActive,
        minValues,
        vandors: [vendor],
      });

      console.log(offer);
      return res.status(200).json(offer);
    }
  }
};
export const EditOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  const offerId= req.params.id;
  if (user) {
    const {
      title,
      description,
      offerType,
      offerAmount,
      pincode,
      promocode,
      promoType,
      startValidity,
      endValidity,
      bank,
      bins,
      isActive,
      minValues,
    } = <CreateOfferrInput>req.body;

    const currentOffer= await Offer.findById(offerId);
    const vendor = await Findvandor(user._id);

    if (vendor) {
        currentOffer.title=title,
        currentOffer.description=description,
        currentOffer.offerType=offerType,
        currentOffer.offerAmount=offerAmount,
        currentOffer.pincode=pincode,
        currentOffer.promocode=promocode,
        currentOffer.promoType=promoType,
        currentOffer.startValidity=startValidity,
        currentOffer.endValidity=endValidity,
        currentOffer.bank=bank,
        currentOffer.bins=bins,
        currentOffer.isActive=isActive,
        currentOffer.minValues=minValues

        const result= await currentOffer.save();

      return res.status(200).json(result);
    }
  }
};
