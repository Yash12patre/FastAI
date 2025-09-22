import { clerkClient } from "@clerk/express";

export const auth =async (req,res, next)=>{

    try {
        const { userId, has } = await req.auth();
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const isPremium = typeof has === 'function' ? await has({ plan: "premium" }) : false;
        const user = await clerkClient.users.getUser(userId);
        const freeUsage = Number(user?.privateMetadata?.free_usage ?? 0);

        req.userId = userId;
        req.plan = isPremium ? "premium" : "free";
        req.free_usage = Number.isFinite(freeUsage) ? freeUsage : 0;
        next(); 

    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ error: "Unauthorized", details: error?.message });
    
    }
}

