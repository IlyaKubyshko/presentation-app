import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  nickname: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model('User', userSchema);
