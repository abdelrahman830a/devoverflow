'use server'

import mongoose from "mongoose";
import Interaction from "../database/interaction.model";
import Question from "../database/question.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";

export async function viewQuestion(params: ViewQuestionParams) {
    try {
        connectToDatabase();

        const { userId, questionId } = params;


        // Update view count for the question we are currently viewing
        await Question.findByIdAndUpdate(
            questionId,
            { $inc: { views: 1 } }
        )

        const userIdObjectId = new mongoose.Types.ObjectId(userId);
        const questionIdObjectId = new mongoose.Types.ObjectId(questionId);
        // check if user already interacted
        if (userId) {
            const existingInteraction = await Interaction.findOne({
                user: userIdObjectId,
                question: questionIdObjectId,
                action: "view",
            })

            if (existingInteraction) return console.log("User already interacted");

            // create interaction
            await Interaction.create({
                user: userId,
                action: "view",
                question: questionId,
            })
        }



    } catch (error) {
        console.log(error);
        throw error;
    }
}