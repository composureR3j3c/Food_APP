import express, { request, response, NextFunction } from "express";
import {
  AddFood,
  AddOffers,
  EditOffers,
  GetCurrentOrders,
  GetFoods,
  GetOffers,
  GetOrderDetails,
  GetVandorprofile,
  ProcessOrder,
  UpdateVandorCoverImage,
  UpdateVandorprofile,
  UpdateVandorservice,
  VandorLogin,
} from "../controllers/VandorControllers";
import { Authenticate } from "../middleware";
import multer from "multer";

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.parse(new Date().toISOString()) + "_" + file.originalname);
  },
});

const images = multer({ storage: imageStorage }).array("images", 10);

router.get("/", (req, res) => {
  return res.json({ message: "Vandor Food Order Backend!!" });
});
router.post("/login", VandorLogin);
router.use(Authenticate);
router.get("/profile", GetVandorprofile);
router.patch("/profile", UpdateVandorprofile);
router.patch("/service", UpdateVandorservice);
router.get("/foods", GetFoods);

router.post("/food", images, AddFood);
router.post("/coverImage", images, UpdateVandorCoverImage);

router.get("/orders", GetCurrentOrders);
router.get("/order/:id", GetOrderDetails);
router.put("/order/:id/process", ProcessOrder);

router.get("/offers", GetOffers);
router.post("/offer", AddOffers);
router.put("/offer/:id", EditOffers);
export { router as VandorRoutes };
