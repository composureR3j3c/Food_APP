import express ,{ request,response,NextFunction} from 'express';
import { Authenticate } from '../middleware';
import { DeliveryUserLogin, DeliveryUserSignup, EditDeliveryUserProfile, GetDeliveryUserProfile, UpdateDeliveryUserStatus } from '../controllers';

const router = express.Router();

router.post("/signup",DeliveryUserSignup);
router.post("/login",DeliveryUserLogin);

router.post('/change-status',Authenticate,UpdateDeliveryUserStatus);

router.get("/profile",Authenticate,GetDeliveryUserProfile);
router.patch("/profile",Authenticate,EditDeliveryUserProfile); 



export {router as DeliveryRoutes};