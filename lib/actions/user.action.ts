'use server'

import { revalidatePath } from "next/cache";
import { FilterQuery } from "mongoose";
import User from "../database/user.model";
import { connectToDatabase } from "../mongoose"
import { CreateUserParams, DeleteUserParams, GetAllUsersParams, GetSavedQuestionsParams, GetUserByIdParams, GetUserStatsParams, ToggleSaveQuestionParams, UpdateUserParams } from "./shared.types";
import Question from "../database/question.model";
import Tag from "../database/tag.model";

import Answer from "../database/answer.model";

export async function getUserById(params: any) {
    try {
        connectToDatabase();

        const { userId } = params;

        const user = await User.findOne({ clerkId: userId });

        return user;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getAllUsers(params: GetAllUsersParams) {
    try {
        connectToDatabase();

        const { searchQuery, filter, page = 1, pageSize = 4 } = params;


        const query: FilterQuery<typeof User> = {};
        if (searchQuery) {
            query.$or = [
                // getting questions with title === searchQuery
                { name: { $regex: new RegExp(searchQuery, "i") } },

                // getting questions with content === searchQuery
                { username: { $regex: new RegExp(searchQuery, "i") } },
            ]
        }

        let sortOptions = {};
        switch (filter) {
            case 'new_users':
                sortOptions = { joinedAt: -1 };
                break;
            case 'old_users':
                sortOptions = { joinedAt: 1 };
                break;
            case 'top_contributors':
                sortOptions = { reputation: -1 }
                break

        }

        const skipAmount = (page - 1) * pageSize;

        const users = await User.find(query)
            .skip(skipAmount)
            .limit(pageSize)
            .sort(sortOptions);

        const totalUsers = await User.countDocuments(query);

        const isNext = totalUsers > (skipAmount + users.length)

        return { users, isNext };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function createUser(userData: CreateUserParams) {
    try {
        connectToDatabase();

        const newUser = await User.create(userData);

        return newUser;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function updateUser(params: UpdateUserParams) {
    try {
        connectToDatabase();

        const { clerkId, updateData, path } = params;

        await User.findOneAndUpdate({ clerkId }, updateData, { new: true })

        revalidatePath(path);


    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function deleteUser(params: DeleteUserParams) {
    try {
        connectToDatabase();

        const { clerkId } = params;

        const user = await User.findOneAndDelete({ clerkId });

        if (!user) {
            throw new Error("user not found")
        }

        // delete User from database
        // delete all questions and answers by user


        // const userQuestions = await Question.find({author: user._id}).distinct('_id');

        // delete user questions
        await Question.deleteMany({ author: user._id })

        // delete user answers, comments, etc

        const deletedUser = await User.findByIdAndDelete(user._id)

        return deletedUser;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
    try {
        connectToDatabase();

        const { userId, questionId, path } = params;

        const user = await User.findById(userId);

        if (!user) throw new Error("User not found");

        const isQuestionSaved = user.saved.includes(questionId);

        if (isQuestionSaved) {
            // remove from saved collection

            await User.findByIdAndUpdate(
                userId,
                { $pull: { saved: questionId } },
                { new: true }
            )
        } else {
            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { saved: questionId } },
                { new: true }
            )
        }
        revalidatePath(path);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
    try {
        connectToDatabase();

        const { clerkId, searchQuery, filter, page = 1, pageSize = 5 } = params;

        const query: FilterQuery<typeof Question> = {};
        if (searchQuery) {
            query.$or = [
                // getting saved questions with title === searchQuery
                { title: { $regex: new RegExp(searchQuery, "i") } },

                // getting saved questions with content === searchQuery
                { content: { $regex: new RegExp(searchQuery, "i") } },

                // getting saved questions with tag name === searchQuery
                { tags: { $in: await Tag.find({ name: { $regex: new RegExp(searchQuery, "i") } }) } }
            ]
        }

        let sortOptions = {};
        switch (filter) {
            case 'most_recent':
                sortOptions = { createdAt: -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'most_voted':
                sortOptions = { upvotes: -1 }
                break;
            case 'most_viewed':
                sortOptions = { views: -1 }
                break;
            case 'most_answered':
                sortOptions = { answers: -1 }
                break;
        }

        const skipAmount = (page - 1) * pageSize;

        const user = await User.findOne({ clerkId }).populate({
            path: 'saved',
            match: query,
            options: {
                skip: skipAmount,
                limit: pageSize + 1,
                sort: sortOptions,
            },
            populate: [
                { path: 'tags', model: Tag, select: "_id name" },
                { path: 'author', model: User, select: "_id clerkId name picture" }
            ]
        })

        if (!user) {
            throw new Error("User not found");
        }

        const savedQuestions = user.saved;

        const isNext = savedQuestions.length > pageSize;

        return { questions: savedQuestions, isNext };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getUserInfo(params: GetUserByIdParams) {
    try {
        connectToDatabase();
        const { userId } = params

        const user = await User.findOne({
            clerkId: userId
        });

        if (!user) {
            throw new Error("User not found! Or not authorized to view this user's profile.");
        }

        const totalQuestions = await Question.countDocuments({ author: user._id });
        const totalAnswers = await Answer.countDocuments({ author: user._id });


        return { user, totalQuestions, totalAnswers };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getUserQuestions(params: GetUserStatsParams) {
    try {
        connectToDatabase();

        const { userId, page = 1, pageSize = 5 } = params;

        const totalQuestions = await Question.countDocuments({
            author: userId
        })

        const skipAmount = (page - 1) * pageSize
        const userQuestions = await Question.find({ author: userId })
            .skip(skipAmount)
            .limit(pageSize)
            .sort({ views: -1, upvotes: -1 })
            .populate({ path: 'tags', model: Tag, select: "_id name" })
            .populate({ path: 'author', model: User, select: "_id clerkId name picture" })


        const isNext = totalQuestions > skipAmount + userQuestions.length;

        return { questions: userQuestions, totalQuestions, isNext };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getUserAnswers(params: GetUserStatsParams) {
    try {
        connectToDatabase();

        const { userId, page = 1, pageSize = 5 } = params;

        const skipAmount = (page - 1) * pageSize

        const totalAnswers = await Answer.countDocuments({ author: userId })

        const userAnswers = await Answer.find({ author: userId })
            .skip(skipAmount)
            .limit(pageSize)
            .sort({ upvotes: -1 })
            .populate({ path: 'question', model: Question, select: "_id title" })
            .populate({ path: 'author', model: User, select: "_id clerkId name picture" })

        const isNext = totalAnswers > skipAmount + userAnswers.length;
        return { answers: userAnswers, totalAnswers, isNext }
    } catch (error) {
        console.log(error);
        throw error;
    }
}