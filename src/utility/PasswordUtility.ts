import bcryptjs from 'bcryptjs'
import { Request } from 'express';
import { VandorPayload } from '../dto';
import jwt from 'jsonwebtoken'
import { APP_SECRET } from '../config';
import { AuthPayload } from '../dto/Admin.dio';

export const GenerateSalt =async () => {
    return await bcryptjs.genSaltSync(10);  
}

export const GeneratePassword =async (password : string,salt: string) => {
    return await bcryptjs.hashSync(password,salt);  
}

export const ValidatePassword =async (enteredPassword:string, password : string,salt: string) => {
    return await bcryptjs.compare(enteredPassword, password);  
}

export const GenerateSignature =async (payload:AuthPayload, ) => {
    return await jwt.sign(payload, APP_SECRET,{expiresIn: '1d'});  
}

export const ValidateSignature  =async (req:Request, ) => {
    const signature = req.get("Authorization");

    if(signature){
         const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET) as AuthPayload;
         req.user=payload
         return true;
    }
    
    return false;

}