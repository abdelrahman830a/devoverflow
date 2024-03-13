'use server'

import { FilterQuery } from "mongoose";
import Question from "../database/question.model";
import Tag, { ITag } from "../database/tag.model";
import User from "../database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetQuestionsByTagIdParams, GetTopInteractedTagsParams } from "./shared.types";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
    try {
        connectToDatabase();

        const { userId } = params;

        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Find interaction for the user and group of tags
        const hotTags = await Tag.aggregate([
            { $project: { name: 1, numberOfQuestions: { $size: '$questions' } } },
            { $sort: { numberOfQuestions: -1 } }, // descending
            { $limit: 2 }
        ])
        return hotTags;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getAllTags(params: GetAllTagsParams) {
    try {
        connectToDatabase();

        const { searchQuery, filter, page = 1, pageSize = 10 } = params;

        const query: FilterQuery<typeof Tag> = {}
        if (searchQuery) {
            query.$or = [
                { name: { $regex: new RegExp(searchQuery, "i") } }
            ]
        }

        let sortOptions = {};
        switch (filter) {
            case 'popular':
                sortOptions = { questions: -1 };
                break;
            case 'recent':
                sortOptions = { createdAt: -1 };
                break;
            case 'old':
                sortOptions = { createdAt: 1 };
                break;
            case 'name':
                sortOptions = { name: 1 }
                break;
        }

        const skipAmount = (page - 1) * pageSize;

        const tags = await Tag.find(query)
            .skip(skipAmount)
            .limit(pageSize)
            .sort(sortOptions)

        const totalTags = await Tag.countDocuments(query);

        const isNext = totalTags > skipAmount + tags.length

        return { tags, isNext };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
    try {
        connectToDatabase();

        const { tagId, page = 1, pageSize = 5, searchQuery } = params;

        const tagFilter: FilterQuery<ITag> = { _id: tagId }

        const skiptAmount = (page - 1) * pageSize;

        const tag = await Tag.findOne(tagFilter)
            .populate({
                path: 'questions',
                model: Question,
                match: searchQuery ? { title: { $regex: searchQuery, $options: 'i' } } : {},
                options: {
                    skip: skiptAmount,
                    limit: pageSize + 1,
                    sort: { createdAt: -1 },
                },
                populate: [
                    { path: 'tags', model: Tag, select: "_id name" },
                    { path: 'author', model: User, select: "_id clerkId name picture" }
                ]
            });

        if (!tag) {
            throw new Error('Tag not found');
        };

        const questions = tag.questions;
        const tagTitle = tag.name;

        const isNext = tag.questions.length > pageSize;

        return { questions, tagTitle, isNext };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getPopularTags() {
    try {
        connectToDatabase();

        const hotTags = await Tag.aggregate([
            { $project: { name: 1, numberOfQuestions: { $size: '$questions' } } },
            { $sort: { numberOfQuestions: -1 } }, // descending
            { $limit: 5 }
        ])

        return hotTags;
    } catch (error) {
        console.log('Error getting hot tags', error);
        throw error;
    }
}