import OpenAI from "openai"
import sql from "../db.js"
const AI =new OpenAI(
    api_key=process.env.GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)


export const generateArticle =async (req,res)=>{
    try {
        const {userId}=req.auth();
        const {prompt, length}= req.body;
        const plan =req.plan;
        const free_usage=req.free_usage;
        if(plan != "premium" && free_usage >=10){
            return req.json({success: false, message:"Limit Reached. Upgrade to continue"})
        }
        response = await AI.chat.completions.create({

            model:"gemini-2.5-flash",
            messages:[{
                "role": "user",
                "content": prompt,
            },
        ],
        temprature:0.7,
        max_token:length,
    });
    const content =response.choices[0].message.content
    await sql`INSERT INTO creations(user_id, prompt, content, type)
              VALUE( ${userId},  ${prompt}, ${content}, 'article')`;
              if(plan !== "premium"){
                await clerkClient.users.updateUserMetadata(userId,{
                    privateMetadata:{
                        free_usage:free_usage+1 
                    }
                 })
              }
    } catch (error) {
        console.log(error.message)
        res.json({message:error.message})
    }
}