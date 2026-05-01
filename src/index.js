import dotenv from 'dotenv';
import dbConnect from './db/index.js';

dotenv.config({
    path:'./env'
})
 

dbConnect()
.then(()=> {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at Port: ${process.env.PORT}`); 
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