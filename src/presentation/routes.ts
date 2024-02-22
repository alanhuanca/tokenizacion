import { Router } from 'express';
import { Authroutes } from './auth/routes';
import {CardRoutes} from './card/routes'




export class AppRoutes {


  static get routes(): Router {

    const router = Router();
    
    // Definir las rutas
    router.use('/api/auth', Authroutes.routes );
    router.use('/api/card',CardRoutes.routes);

    return router;
  }


}

