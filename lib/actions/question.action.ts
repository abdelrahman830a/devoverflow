'use server'

import { revalidatePath } from "next/cache";
import Question from "../database/question.model";
import Tag from "../database/tag.model";
import User from "../database/user.model";
import { connectToDatabase } from "../mongoose"
import { CreateQuestionParams, GetQuestionByIdParams, GetQuestionsParams } from "./shared.types";

export async function getQuestions(params: GetQuestionsParams) {

    try {
        connectToDatabase();
        const questions = await Question.find({})
            .populate({ path: "tags", model: Tag })
            .populate({ path: 'author', model: User })
            .sort({ createdAt: -1 });

        return { questions };
    } catch (error) {
        console.log('Error getting questions', error);
        throw error;
    }
}


export async function createQuestion(params: CreateQuestionParams) {
    try {
        await connectToDatabase();

        const { title, content, author, tags, path } = params;

        const question = await Question.create({
            title,
            content,
            author,
        });

        const tagDocument = [];

        for (const tag of tags) {
            const existingTag = await Tag.findOneAndUpdate(
                { name: { $regex: new RegExp(`^${tag}$`, "i") } },
                { $setOnInsert: { name: tag }, $push: { questions: question._id } },
                { upsert: true, new: true }
            );

            tagDocument.push(existingTag._id);
        }

        await Question.findByIdAndUpdate(question._id, {
            $push: { tags: { $each: tagDocument } },
        });

        // create an interaction record for authors asking questions

        // incerment author's reputation

        revalidatePath(path);
    } catch (error) {
        console.log('Error creating question', error);
        throw error;
    }

}

export async function getQuestionById(params: GetQuestionByIdParams) {
    try {
        connectToDatabase();

        const { questionId } = params;

        const question = await Question.findById(questionId)
            .populate({ path: 'tags', model: Tag, select: '_id name' })
            .populate({ path: 'author', model: User, select: '_id clerkId name picture' });

        return question;
    } catch (error) {
        console.log('Error getting question by id', error);
        throw error;
    }
}