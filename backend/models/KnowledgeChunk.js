
import mongoose from "mongoose";

const knowledgeChunkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sourceType: {
      type: String,
      enum: ["document", "website", "github"],
      required: true,
    },

    sourceName: {
      type: String,
      required: true,
      trim: true,
    },

    sourceUrl: {
      type: String,
      default: null,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) && value.length > 0,
        message: "Embedding cannot be empty",
      },
    },

    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeChunkSchema.index({
  userId: 1,
  sourceType: 1,
});

export default mongoose.models.KnowledgeChunk ||
  mongoose.model("KnowledgeChunk", knowledgeChunkSchema);
