import { Router } from 'express';
//import { AuthMiddleware } from '../middlewares/auth.middleware';
import { CardController } from './controller';
import { CardService } from '../services/card.service';
import { AuthService } from '../services/auth.service';


export class CardRoutes {


  static get routes(): Router {

    const router = Router();
    const cardService = new CardService();
    const authService = new AuthService();
    const controller = new CardController( cardService ,authService);

    // Definir las rutas
    
    //router.post( '/',[ AuthMiddleware.validateJWT ], controller.createCard );
    router.post( '/tokencard', controller.tokenizationCard );
    router.get( '/validate/:token', controller.validateToken );

    return router;
  }


}