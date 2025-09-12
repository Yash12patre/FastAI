import {neon} from "@neondatabase/serverless"


const sql=neon(`4{process.env.DATABSE_URL}`);


export default sql;