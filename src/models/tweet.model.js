import mongoose, { Schema, model } from 'mongoose'

const tweetSchema = new Schema({
    content:{
        required:true,
        Type:String
    },
        owner:{
            Type:Schema.Types.ObjectId,
            ref:"User"
        },
        
    
}, {timestamps:true})

export const Tweet = Model("Tweet", tweetSchema)