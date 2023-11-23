import express ,{ request,response,NextFunction} from 'express';
import { GetFoodAvailability, GetFoodsIn30mins,GetOffersPin, GetTopRestaurants, RestaurantsById, SearchFoods } from '../controllers';

const router = express.Router();

router.get('/:pincode',GetFoodAvailability) 
router.get('/top-restaurants/:pincode',GetTopRestaurants)

router.get('/foods-in-30-min/:pincode',GetFoodsIn30mins)
router.get('/search/:pincode',SearchFoods)
router.get('/offers/:pincode',GetOffersPin)
router.get('/restaurant/:id',RestaurantsById)

export {router as ShoppingRoutes};