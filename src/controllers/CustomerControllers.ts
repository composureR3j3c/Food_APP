import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import express, { Request, Response, NextFunction } from "express";
import {
  CreateCustomerInput,
  EditCustomerProfileInput,
  OrderInputs,
  UserLoginInput,
} from "../dto/Customer.dio";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utility";
import { Customer, Food } from "../models";
import { GenerateOtp, OnRequestOTP } from "../utility/NotificationUtility";
import { Order } from "../models/Order";
export const CustomerSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInput, req.body);
  const inputError = await validate(customerInputs, {
    validationError: { target: true },
  });
  if (inputError.length > 0) {
    return res.status(400).json(inputError);
  }
  const { email, phone, password } = customerInputs;

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
export const CustomerLogin = async (
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
export const CustomerVerify = async (
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
export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    console.log(customer._id);
    const profile = await Customer.findById(customer._id);

    if (profile) {
      const { otp, expiry } = GenerateOtp();

      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      await OnRequestOTP(otp, profile.phone);

      return res
        .status(200)
        .json({ message: "OTP set to your registerd phone" });
    }
  }
  return res.status(400).json({
    message: "Resend Error!",
  });
};
export const GetCustomerProfile = async (
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
export const EditCustomerProfile = async (
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

export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const orderId = `${Math.floor(Math.random() * 89999 + 1000)}`;
    const profile = await Customer.findById(customer._id);
    const cart = <[OrderInputs]>req.body;

    let cartItems = Array();
    let netAmount = 0.0;

    const foods = await Food.find()
      .where("_id")
      .in(cart.map((item) => item._id))
      .exec();

    foods.map((food) => {
      cart.map(({ _id, unit }) => {
        if (food._id == _id) {
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    if (cartItems) {
      const currentOrder = await Order.create({
        orderId: orderId,
        vandorId: "6523b48c29c5a41b5605b32c",
        items: cartItems,
        totalAmount: netAmount,
        orderDate: new Date(),
        paidThrough: "Cash",
        paymentResponse: "",
        orderStatus: "Waiting", 
      });
      if (currentOrder) {
        profile.orders.push(currentOrder);
        await profile.save();
        return res.status(200).json(currentOrder);
      }
    }
  }
  return res.status(400).json({ message: "Error with Create Order!" });
};
export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders", {
      strictPopulate: false,
    });
    console.log(profile.toString())

    if(profile){
      return res.status(200).json(profile)
    }
  }
};
export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;
  if (orderId) {
    const order = (await Customer.findById(orderId)).populate("orders", {
      strictPopulate: false,
    });

    if(order){
      return res.status(200).json(order)
    }
  }
  return res.status(404).json({message:"No order found"})
};
export const AddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer= req.user;
  if(customer){
    const profile = await Customer.findById(customer._id)
    .populate('cart.food',{
      strictPopulate: false,
    });
    let cartItems=Array();
    const {_id,unit}=<OrderInputs>req.body;

    const food= await Food.findById(_id);
    if(food){
    if (profile!=null) { 
      cartItems=profile.cart;
      if(cartItems.length>0){
        let existFoodItems=cartItems.filter((item)=>item.food._id.toString()===_id);
        if(existFoodItems.length>0){
          const index=cartItems.indexOf(existFoodItems[0]);
          if(unit>0){
            cartItems[index]= {food,unit};
          }else{ 
            cartItems.splice(index,1);
          }
        }
        else{
          cartItems.push({food,unit})
        }
      }else{
        cartItems.push({food,unit})
      }
      if(cartItems){
        const cartResult=await profile.save();
        return res.status(200).json(cartResult.cart);
      }
    }}
  }
    return res.status(400).json({message:"Unable to Add to Cart!"})
};
export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food", {
      strictPopulate: false,
    });

    if(profile){
      return res.status(200).json(profile.cart);
    }
  }
  return res.status(404).json({message:"cart is empty"})
};
export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food", {
      strictPopulate: false,
    });

    if(profile!=null){

      profile.cart= [] as any;
      const cartResult=await profile.save();

      return res.status(200).json(cartResult);
    }
  }
  return res.status(404).json({message:"cart is already empty"})
};
