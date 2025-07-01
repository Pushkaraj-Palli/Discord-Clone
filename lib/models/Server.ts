import mongoose, { Schema, models, model } from 'mongoose';

const ServerSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: null,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  textChannels: [
    {
      name: { type: String, required: true },
      // Add other properties if needed, e.g., messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
    },
  ],
  voiceChannels: [
    {
      name: { type: String, required: true },
      // Add other properties if needed, e.g., usersConnected: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    },
  ],
}, {
  timestamps: true,
});

const Server = models.Server || model('Server', ServerSchema);

export default Server; 