import express ,{ request,response,NextFunction} from 'express';
import { CreateVender, GetDeliveryUser, GetTransactions, GetTransactionsById, GetVenderBYID, GetVenders, VerifyDeliveryUser } from '../controllers';

const router = express.Router();

router.post("/vander", CreateVender);
router.get("/vander/:id", GetVenderBYID);
router.get("/vander", GetVenders);

router.get("/transaction/:id", GetTransactionsById);
router.get("/transaction", GetTransactions);

router.post("/delivery/verify",VerifyDeliveryUser)
router.get("/delivery/users",GetDeliveryUser)

router.get("/", async (req, res, next) => {
    return res.json({"message":"Admin Food Order Backend!!"});
  }); 

  export {router as AdminRoutes};