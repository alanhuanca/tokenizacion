import { regularExps, luhnCheck } from '../../../config';




export class CardDto {

    private constructor(
        public card_number: number,
        public cvv: number,
        public expiration_month: string,
        public expiration_year: string,
        public email: string,
    ) { }

    static create(object: { [key: string]: any }): [string?, CardDto?] {
        const { card_number, cvv, expiration_month, expiration_year, email } = object;

        if (!card_number) return ['Missing cvv'];
        if (!cvv) return ['Missing cvv'];
        if (!expiration_month) return ['Missing expiration month'];
        if (!expiration_year) return ['Missing expiration year'];
        if (!cvv) return ['Missing password'];
        if (!email) return ['Missing email'];

        if (luhnCheck(card_number)) return ['invalid card'];
        if (!regularExps.emailspecial.test(email)) return ['Email is not valid'];

        if (String(cvv).length < 3 || String(cvv).length > 4) return ['cvv incorrect'];

        let card_year: number = parseInt(expiration_year);
        let card_month: number = parseInt(expiration_month);

        if (card_month < 1 || card_month> 12) return ['expiration month incorrect'];

        let current_month = new Date().getMonth(); 
        let current_year = new Date().getFullYear();

        if (card_year < current_year || (card_year === current_year && card_month < current_month)) {
            return ['expiration date incorrect'];
        }

        return [undefined, new CardDto(card_number, cvv, expiration_month, expiration_year, email)];

    }


}