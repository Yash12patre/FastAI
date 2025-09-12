import { clerkClient } from "@clerk/express";

export const auth =async (req,res, next)=>{

    try {
        const {userId, has}= await req.auth()
        const hasPremiun=await has({plan: "premium"});
        const user=await clerkClient.users.getUser(userId)
        if(!hasPremiun && user.privateMetadata.free_usage){
            req.free_usage =user.privateMetadata(userId,{
                privateMetadata:{
                    free_usage:0
                }
            })
            req.free_usage=0;
        }
        req.plan=hasPremiun ? "premium": "free"
        next(); 

    } catch (error) {
        
    }
}

