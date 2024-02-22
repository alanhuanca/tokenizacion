import { JwtAdapter, bcryptAdapter } from '../../config';
import { CardModel } from '../../data';
import { CardDto, CustomError, UserEntity } from '../../domain';
import { createClient } from 'redis';


export class CardService {

    // DI
    constructor() { }


    async tokenizationCard(cardDto: CardDto) {
        
        const client = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect();

        const cardExists = await CardModel.findOne({ card_number: cardDto.card_number });
        if (cardExists) {
            let data = await client.get(String(cardDto.card_number));
            
            await client.disconnect();
            let dataCache=JSON.parse(data ?? '');
            delete dataCache.cvv;
            return dataCache;
          }
        try {

            const card = new CardModel({
                ...cardDto,
            });

            await card.save();

            const token = await JwtAdapter.generateToken({
                card_number: cardDto.card_number,
                expiration_month: cardDto.expiration_month,
                expiration_year: cardDto.expiration_year,
                email: cardDto.email,
            });
            if (!token) throw CustomError.internalServer('Error while creating JWT');
         
            let dataResp={
                card_number: cardDto.card_number,
                expiration_month: cardDto.expiration_month,
                expiration_year: cardDto.expiration_year,
                email: cardDto.email,
            };

            await client.set(String(cardDto.card_number), JSON.stringify(
                {
                    card: dataResp,
                    token:token,
                }));
              await client.disconnect();

            return {
                card: dataResp,
                token: token,
            };

        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }

    }

}