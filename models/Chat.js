import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: "New Conversation",
      trim: true,
    },

    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Chat ||
  mongoose.model("Chat", chatSchema);