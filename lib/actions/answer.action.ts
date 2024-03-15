'use server'
import { revalidatePath } from "next/cache";
import Answer from "../database/answer.model";
import Question from "../database/question.model";
import { connectToDatabase } from "../mongoose"
import { AnswerVoteParams, CreateAnswerParams, DeleteAnswerParams, GetAnswersParams } from "./shared.types";
import Interaction from "../database/interaction.model";
import User from "../database/user.model";

export async function createAnswer(params: CreateAnswerParams) {
    try {
        connectToDatabase();

        const { author, question, content, path } = params;

        const newAnswer = await Answer.create({
            author,
            question,
            content,
        });


        const questionObject = await Question.findByIdAndUpdate(question, {
            $push: { answers: newAnswer._id }
        })

        // create an interaction record for the user answering the question
        await Interaction.create({
            user: author,
            action: 'answer',
            question,
            answer: newAnswer._id,
            tags: questionObject.tags,
        })
        // increment user's reputation by +10 for answering a question
        await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });


        revalidatePath(path);
    } catch (error) {
        console.log("Error creating answer", error);
        throw error;
    }
}

export async function getAllAnswers(params: GetAnswersParams) {
    try {
        connectToDatabase();

        const { questionId, sortBy, page = 1, pageSize = 1 } = params;

        let sortOptions = {};
        switch (sortBy) {
            case 'highestUpvotes':
                sortOptions = { upvotes: -1 };
                break;
            case 'lowestUpvotes':
                sortOptions = { upvotes: 1 };
                break;
            case 'recent':
                sortOptions = { createdAt: -1 }
                break;
            case 'old':
                sortOptions = { createdAt: 1 }
                break;
        }

        const skipAmount = (page - 1) * pageSize;

        const answers = await Answer.find({ question: questionId })
            .skip(skipAmount)
            .limit(pageSize)
            .populate('author', '_id clerkId name picture')
            .sort(sortOptions)

        const totalAnswers = await Answer.countDocuments({ question: questionId });

        const isNext = totalAnswers > skipAmount + answers.length;

        return { answers, isNext };
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

        // increment user's reputation by +1/-1 for upvoting/revoking the upvote
        await User.findByIdAndUpdate(userId, { $inc: { reputation: hasupVoted ? -1 : 2 } });

        // increment author's reputation by +10/-10 for upvoting/revoking the upvote
        await User.findByIdAndUpdate(answer.author, { $inc: { reputation: hasupVoted ? -10 : 10 } });

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

        // increment user's reputation by +1/-1 for downvoting/revoking the downvote
        await User.findByIdAndUpdate(userId, { $inc: { reputation: hasdownVoted ? -1 : 2 } });

        // increment author's reputation by +10/-10 for downvoting/revoking the downvote
        await User.findByIdAndUpdate(answer.author, { $inc: { reputation: hasdownVoted ? -10 : 10 } });

        revalidatePath(path);
    } catch (error) {
        console.log("Error downvoting answer", error);
        throw error;
    }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
    try {
        connectToDatabase();

        const { answerId, path, authorId } = params;

        const answer = await Answer.findById(answerId);

        if (!answer) throw new Error("Answer not found");

        await answer.deleteOne({ _id: answerId });
        await Question.updateMany(
            { _id: answer.question },
            { $pull: { answers: answerId } }
        )
        await Interaction.deleteMany({ answer: answerId });

        // decrement user's reputation by -10 for deleting an answer
        await User.findByIdAndUpdate(JSON.parse(authorId || ""), { $inc: { reputation: -10 } });

        revalidatePath(path);
    } catch (error) {
        console.log('Error deleting question', error);
        throw error;
    }
}
