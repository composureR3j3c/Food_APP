import express ,{ request,response,NextFunction} from 'express';
import { AddToCart, CreateOrder, CreatePayment, CustomerLogin, CustomerSignup, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrderById, GetOrders, RequestOtp, VerifyOffers } from '../controllers/CustomerControllers';
import { Authenticate } from '../middleware';

const router = express.Router();

router.post("/signup",CustomerSignup);
router.post("/login",CustomerLogin);
router.post("/verify",Authenticate,CustomerVerify); 
router.get("/otp",Authenticate,GetOrders);

router.get("/profile",Authenticate,GetCustomerProfile);
router.patch("/profile",Authenticate,EditCustomerProfile);  

router.post("/create-order",Authenticate,CreateOrder);
router.get("/orders",Authenticate,GetOrders);
router.get("/order/:id",Authenticate,GetOrderById); 

router.post("/cart",Authenticate,AddToCart);
router.get("/cart",Authenticate,GetCart);
router.delete("/cart",Authenticate,DeleteCart); 

router.get('/offer/verify/:id',Authenticate,VerifyOffers)
router.post('/create-payment',Authenticate,CreatePayment)
 
router.get("/", async (req, res, next) => {
    return res.json({"message":"Admin Food Order Backend!!"});
  }); 

  export {router as CustomerRoutes};