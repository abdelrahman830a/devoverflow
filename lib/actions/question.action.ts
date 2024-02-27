'use server'

import Question from "../database/question.model";
import Tag from "../database/tag.model";
import { connectToDatabase } from "../mongoose"

export async function createQuestion(params: any) {
    try {
        await connectToDatabase();

        const { title, content, author, tags, path } = params;

        const question = await Question.create({
            title,
            content,
            author,
            tags,
        });

        const tagDocument = [];

        for (const tag of tags) {
            const existingTag = await Tag.findOneAndUpdate(
                { name: { $regex: new RegExp(`^${tag}$`, "i") } },
                { $setOnInsert: { name: tag }, $push: { question: question._id } },
                { upsert: true, new: true }
            )

            tagDocument.push(existingTag._id);
        }

        await Question.findByIdAndUpdate(question._id, { $push: { tags: { $each: tagDocument } } });

        // create an interaction record for authors asking questions

        // incerment author's reputation
    } catch (error) {
        console.log('Error creating question', error)
    }
}