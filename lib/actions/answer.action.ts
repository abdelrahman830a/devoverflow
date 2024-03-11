'use server'
import { revalidatePath } from "next/cache";
import Answer from "../database/answer.model";
import Question from "../database/question.model";
import { connectToDatabase } from "../mongoose"
import { AnswerVoteParams, CreateAnswerParams, DeleteAnswerParams, GetAnswersParams } from "./shared.types";
import Interaction from "../database/interaction.model";

export async function createAnswer(params: CreateAnswerParams) {
    try {
        connectToDatabase();

        const { author, question, content, path } = params;

        const newAnswer = await Answer.create({
            author,
            question,
            content,
        });


        await Question.findByIdAndUpdate(question, {
            $push: { answers: newAnswer._id }
        })
        revalidatePath(path);
    } catch (error) {
        console.log("Error creating answer", error);
        throw error;
    }
}

export async function getAllAnswers(params: GetAnswersParams) {
    try {
        connectToDatabase();

        const { questionId } = params;

        const answers = await Answer.find({ question: questionId })
            .populate('author', '_id clerkId name picture')
            .sort({ createdAt: -1 });

        return { answers };
    } catch (error) {
        console.log("Error getting all answers", error);
        throw error;
    }
}

export async function upvoteAnswer(params: AnswerVoteParams) {
    try {
        connectToDatabase();

        const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

        let updateQuery = {};

        if (hasupVoted) {
            updateQuery = { $pull: { upvotes: userId } }
        } else if (hasdownVoted) {
            updateQuery = { $pull: { downvotes: userId }, $push: { upvotes: userId } };
        }
        else {
            updateQuery = { $addToSet: { upvotes: userId } };
        }

        const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, { new: true });

        if (!answer) throw new Error("Answer not found");

        revalidatePath(path);
    } catch (error) {
        console.log("Error upvoting answer", error);
        throw error;
    }
}

export async function donwVoteAnswer(params: AnswerVoteParams) {
    try {
        connectToDatabase();

        const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

        let updateQuery = {};

        if (hasdownVoted) {
            updateQuery = { $pull: { downVotes: userId } }
        } else if (hasupVoted) {
            updateQuery = { $pull: { upvotes: userId }, $push: { downvotes: userId } }
        } else {
            updateQuery = { $addToSet: { downVotes: userId } }
        }

        const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, { new: true });
        console.log(answer);

        if (!answer) throw new Error("Answer not found");

        revalidatePath(path);
    } catch (error) {
        console.log("Error downvoting answer", error);
        throw error;
    }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
    try {
        connectToDatabase();

        const { answerId, path } = params;

        const answer = await Answer.findById(answerId);

        if (!answer) throw new Error("Answer not found");

        await answer.deleteOne({ _id: answerId });
        await Question.updateMany(
            { _id: answer.question },
            { $pull: { answers: answerId } }
        )
        await Interaction.deleteMany({ answer: answerId });


        revalidatePath(path);
    } catch (error) {
        console.log('Error deleting question', error);
        throw error;
    }
}
