import mongoose from 'mongoose';


export class Validators {

    static isMongoID( id: string ){

        return  typeof id === "string" && mongoose.isValidObjectId(id);
    }
}