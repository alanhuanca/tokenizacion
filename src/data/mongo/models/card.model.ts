import mongoose, { Schema } from 'mongoose';


const cardSchema = new mongoose.Schema({

    card_number: {
        type: Number,
        required: [true, 'Card number is required'],
        unique: true,
    },
    cvv: {
        type: Number,
        required: [true, 'cvv is required'],
    },
    expiration_month: {
        type: String,
        required: [true, 'expiration month is required'],
    },
    expiration_year: {
        type: String,
        required: [true, 'expiration year is required'],
    },
    email: {
        type: String,
        required: [ true, 'Email is required' ],
    },

});


cardSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id;
    },
})


export const CardModel = mongoose.model('Card', cardSchema);