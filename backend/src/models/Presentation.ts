import { Schema, model, Types } from 'mongoose';

const slideSchema = new Schema({
  id: Number,
  backgroundColor: String,
  elements: [{}],                                // зберігаємо «як є»
});

const presentationSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Без назви' },
  slides: [slideSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default model('Presentation', presentationSchema);
