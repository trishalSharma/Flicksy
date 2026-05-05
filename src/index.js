import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path:'./env'
})

dbConnect()
.then(()=> {
   const  PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
        console.log(`Server is running at Port: ${PORT}`); 
    });
})
.catch((err) => {
    console.log("DB connection failed",err);    
});



// const app = express()

// (async () => {
// try {
//        await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error",(error) =>{
//         console.log("Error:",error);
//         throw error
//        })

//        app.listen(process.env.PORT, () => {
// console.log(`APP IS LISTENING ON PORT ${process.env.PORT}`);
//        })
// } catch (error) {
//     console.error("Error:",error)
// }
// }) ()