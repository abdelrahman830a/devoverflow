'use server'

import { revalidatePath } from "next/cache";
import Question from "../database/question.model";
import Tag from "../database/tag.model";
import User from "../database/user.model";
import { connectToDatabase } from "../mongoose"
import { CreateQuestionParams, GetQuestionByIdParams, GetQuestionsParams, QuestionVoteParams } from "./shared.types";

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

export async function upvoteQuestion(params: QuestionVoteParams) {
    try {
        connectToDatabase();

        const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

        let updateQuery = {};

        if (hasupVoted) {
            updateQuery = { $pull: { upvotes: userId } }
        } else if (hasdownVoted) {
            updateQuery = { $pull: { downvotes: userId }, $push: { upvotes: userId } };
        }
        else {
            updateQuery = { $addToSet: { upvotes: userId } };
        }

        const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });

        if (!question) throw new Error("Question not found");

        revalidatePath(path);
    } catch (error) {
        console.log("Error upvoting question", error);
        throw error;
    }
}

export async function donwVoteQuestion(params: QuestionVoteParams) {
    try {
        connectToDatabase();

        const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

        let updateQuery = {};

        if (hasdownVoted) {
            updateQuery = { $pull: { downvotes: userId } }
        } else if (hasupVoted) {
            updateQuery = { $pull: { upvotes: userId }, $push: { downvotes: userId } }
        } else {
            updateQuery = { $addToSet: { downvotes: userId } }
        }

        const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });

        if (!question) throw new Error("Question not found");

        revalidatePath(path);
    } catch (error) {
        console.log("Error downvoting question", error);
        throw error;
    }
}

// export async function saveQuestion(params: ToggleSaveQuestionParams) {
//     try {
//         connectToDatabase();

//         const { questionId, userId, path } = params;

//         revaidatePath(path);
//     } catch (error) {
//         console.log("Error saving question", error);
//         throw error;
//     }
// }
