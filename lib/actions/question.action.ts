'use server'

import { revalidatePath } from "next/cache";
import { FilterQuery } from "mongoose";
import Question from "../database/question.model";
import Tag from "../database/tag.model";
import User from "../database/user.model";
import { connectToDatabase } from "../mongoose"
import { CreateQuestionParams, DeleteQuestionParams, EditQuestionParams, GetQuestionByIdParams, GetQuestionsParams, QuestionVoteParams } from "./shared.types";
import Interaction from "../database/interaction.model";
import Answer from "../database/answer.model";

export async function getQuestions(params: GetQuestionsParams) {

    try {
        connectToDatabase();

        const { searchQuery, filter, page = 1, pageSize = 5 } = params;

        const query: FilterQuery<typeof Question> = {};
        if (searchQuery) {
            query.$or = [
                // getting questions with title === searchQuery
                { title: { $regex: new RegExp(searchQuery, "i") } },

                // getting questions with content === searchQuery
                { content: { $regex: new RegExp(searchQuery, "i") } },

                // getting questions with tag name === searchQuery
                { tags: { $in: await Tag.find({ name: { $regex: new RegExp(searchQuery, "i") } }) } }
            ]
        }


        let sortOptions = {};
        switch (filter) {
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'frequent':
                sortOptions = { views: -1 };
                break;
            case 'unanswered':
                query.answers = { $size: 0 };
                break;
            case 'recommended':
                sortOptions = { createdAt: -1 }
                break;
        }

        // Calculate number of posts to skip based on the page number and page size
        const skipAmount = (page - 1) * pageSize;


        const questions = await Question.find(query)
            .populate({ path: "tags", model: Tag })
            .populate({ path: 'author', model: User })
            .skip(skipAmount)
            .limit(pageSize)
            .sort(sortOptions)


        const totalQuestions = await Question.countDocuments(query);

        const isNext = totalQuestions > skipAmount + questions.length;

        return { questions, isNext };
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
        await Question.findByIdAndUpdate(author, { $inc: { reputation: 20 } });

        revalidatePath(path);
    } catch (error) {
        console.log('Error creating question', error);
        throw error;
    }

}

export async function getQuestionById(params: GetQuestionByIdParams) {
    try {
        connectToDatabase();

        const { questionId, } = params;

        const question = await Question.findById(questionId)
            .populate({ path: 'tags', model: Tag, select: '_id name' })
            .populate({ path: 'author', model: User, select: '_id clerkId name picture' });

        if (!question) throw new Error('Question not found');

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

export async function editQuestion(params: EditQuestionParams) {
    try {
        connectToDatabase();

        const { questionId, title, content, path } = params;

        const question = await Question.findById(questionId).populate('tags')

        if (!question) throw new Error('Question not found');

        question.title = title;
        question.content = content;

        await question.save();
        revalidatePath(path);
    } catch (error) {
        console.log('Error editing question', error);
        throw error;
    }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
    try {
        connectToDatabase();

        const { questionId, path } = params;

        await Question.deleteOne({ _id: questionId });
        await Answer.deleteMany({ question: questionId });
        await Interaction.deleteMany({ question: questionId });
        await Tag.updateMany(
            { questions: questionId },
            { $pull: { questions: questionId } }
        )

        revalidatePath(path);
    } catch (error) {
        console.log('Error deleting question', error);
        throw error;
    }
}

export async function getHotQuestions() {
    try {
        connectToDatabase();

        const hotQuestions = await Question.find({})
            .sort({ views: -1, upvotes: -1 })
            .limit(5)

        return hotQuestions;
    } catch (error) {
        console.log('Error getting hot questions', error);
        throw error;
    }
}
