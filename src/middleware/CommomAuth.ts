import { Request,Response,NextFunction } from "express";
import { AuthPayload } from "../dto/Admin.dio";
import { ValidateSignature } from "../utility";

declare global{
    namespace Express{
        interface Request{
            user?:AuthPayload
        }
    }   
}

export const Authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    const validate= await ValidateSignature(req);
    if (validate) {
        next();
    }else{
        return res.status(403).json({"message":"user not Autherized"})
    }

  }