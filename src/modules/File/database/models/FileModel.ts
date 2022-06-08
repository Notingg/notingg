import { Schema, models, model } from 'mongoose';

const FileSchema = new Schema(
  {
    key: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    original_name: {
      type: Schema.Types.String,
      required: true,
    },
    size: {
      type: Schema.Types.Number,
      required: true,
    },
    storage_type: {
      type: Schema.Types.String,
      required: true,
    },
    mimetype: {
      type: Schema.Types.String,
      required: true,
    },
    url: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export default models.File || model('File', FileSchema);
