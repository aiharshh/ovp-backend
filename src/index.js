// require('dotenv').config({path: './.env'})
// under scripts -> "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js" -> if we want to use import dotenv instead of require(config)

import dotenv from "dotenv"
dotenv.config({ path: './.env' })

import mongoose from "mongoose"
import {DB_NAME} from "./constants.js"
import connectDB from "./db/index.js"

connectDB()

/*
// This is the FIRST APPROACH - Everything is in one place that is the database connection is in one place
// and index.js is overwhelmed for connection but the better approach is to make a sepearte 
// folder named as db and do everything there itself
// in the first approach we created an IIFE

An IIFE (pronounced "iffy", standing for Immediately Invoked Function Expression) is a JavaScript function
that runs the exact moment it is defined. It is also known as a self-executing anonymous function.
 An IIFE wraps a function inside parentheses and adds an extra pair of parentheses at the end to trigger it. 

the below part is an IIFE -> ()()

// (function () {
//     console.log("I run right away!");
// })();



import express from "express"
const app = express()

( async() => {
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw err
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is Listening to PORT ${process.env.PORT}`);
        })
    }
    catch( error ){
        console.log("ERROR: ", error);
        throw err
    }
})()

*/