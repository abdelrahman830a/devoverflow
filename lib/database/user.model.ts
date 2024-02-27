import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    clerkid: string;
    name: string;
    username: string;
    email: string;
    password?: string;
    bio?: string;
    picture: string;
    location: string;
    portfoliowebsite?: string;
    reputation: number;
    saved: Schema.Types.ObjectId[];
    joinedAt: Date;
}

const userSchema = new Schema({
    clerkid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: '' },
    picture: { type: String, required: true },
    location: { type: String, default: '' },
    portfoliowebsite: { type: String, default: '' },
    reputation: { type: Number, default: 0 },
    saved: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    joinedAt: { type: Date, default: Date.now }
})

const User = model<IUser>('User', userSchema)

export default User;