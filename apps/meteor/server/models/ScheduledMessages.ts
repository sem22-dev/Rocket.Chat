import { Mongo } from 'meteor/mongo';

// Define the ScheduledMessages collection
export const ScheduledMessages = new Mongo.Collection('scheduled_messages');