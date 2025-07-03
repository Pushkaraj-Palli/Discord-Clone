import mongoose, { Schema, models, model } from 'mongoose';

const InvitationSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false }); // Ensure subdocument does not get its own _id

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
  invitations: {
    type: [InvitationSchema],
    default: [], // Ensure invitations is always an array, even if empty
  },
}, {
  timestamps: true,
});

const Server = models.Server || model('Server', ServerSchema);

export default Server; 