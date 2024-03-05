'use server'

import Tag from "../database/tag.model";
import User from "../database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetTopInteractedTagsParams } from "./shared.types";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
    try {
        connectToDatabase();

        const { userId } = params;

        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Find interaction for the user and group of tags

        return [{
            _id: '1',
            name: 'tag1'
        }, {
            _id: '2',
            name: 'tag2'
        },
        ]
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getAllTags(params: GetAllTagsParams) {
    try {
        connectToDatabase();

        const tags = await Tag.find({});

        return { tags };
    } catch (error) {
        console.error(error);
        throw error;
    }
}