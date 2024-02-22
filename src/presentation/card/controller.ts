import { Response, Request } from 'express';
import { CardDto, CustomError } from '../../domain';
import { CardService } from '../services/card.service';
import { AuthService } from '../services/auth.service';



export class CardController {

  // DI
  constructor(
    private readonly cardService: CardService,
    public readonly authService: AuthService,
  ) { }


  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: 'Internal server error' });
  };


  tokenizationCard = (req: Request, res: Response) => {

    const [error, cardDto] = CardDto.create({
      ...req.body
    });
    if (error) return res.status(400).json({ error });

    this.cardService.tokenizationCard(cardDto!)
      .then(card => res.status(201).json(card))
      .catch(error => this.handleError(error, res));

  };

  validateToken = (req: Request, res: Response) => {

    const { token } = req.params;
    
    this.authService.validateToken( token )
      .then( card => res.status(201).json(card))
      .catch( error => this.handleError(error, res) );

  }

}