import OpenAI from "openai"
import sql from "../utils/db.js"
// If you use Clerk, import clerkClient. Otherwise, comment or remove the following line:
import { clerkClient } from '@clerk/clerk-sdk-node';
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
    try {
        // Adjust this line based on your auth middleware
        const userId = req.user?.id || req.auth?.userId || req.auth?.id;
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;
        if (plan !== "premium" && free_usage >= 10) {
            return res.json({ success: false, message: "Limit Reached. Upgrade to continue" });
        }
        const response = await AI.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: length,
        });
        const content = response.choices[0].message.content;
        await sql`INSERT INTO creations(user_id, prompt, content, type)
                  VALUES (${userId}, ${prompt}, ${content}, 'article')`;
        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }
        res.json({ success: true, content });
    } catch (error) {
        console.log(error.message);
        res.json({ message: error.message });
    }
}
export const generateBlogTitle = async (req, res) => {
    try {
        // Adjust this line based on your auth middleware
        const userId = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;
        if (plan !== "premium" && free_usage >= 10) {
            return res.json({ success: false, message: "Limit Reached. Upgrade to continue" });
        }
        const response = await AI.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });
        const content = response.choices[0].message.content;
        await sql`INSERT INTO creations(user_id, prompt, content, type)
                  VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;
        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }
        res.json({ success: true, content });
    } catch (error) {
        console.log(error.message);
        res.json({ message: error.message });
    }
}

export const generateImage = async (req, res) => {
    try {
        const userId = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;
        if (plan !== "premium") {
            return res.json({ success: false, message: "Limit Reached. Upgrade to continue" });
        }
        const formData = new FormData()
        formData.append('prompt', prompt)
        
       const {data}=await axios.post('prompt', formData, {
            headers:{
                 'x-api-key': process.env.CLIPDROP_API_KEY
            },
            responseType:"arrayBuffer",
        })
        const base64Image= `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`
       const {secure_url}= await cloudinary.uploader.upload(base64Image)

        await sql`INSERT INTO creations(user_id, prompt, content, type,publish)
                  VALUES (${userId}, ${prompt}, ${secure_url}, 'image',${publish ?? false})`;

       
        res.json({ success: true, content : secure_url});
    } catch (error) {
        console.log(error.message);
        res.json({ message: error.message });
    }
}