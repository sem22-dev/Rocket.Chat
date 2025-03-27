import { Meteor } from 'meteor/meteor';
import { cronJobs } from '@rocket.chat/cron';
import { Messages } from '@rocket.chat/models';
import { ScheduledMessages } from '../models/ScheduledMessages';
import { executeSendMessage } from '/app/lib/server/methods/sendMessage';

Meteor.startup(() => {
  // Register the cron job with @rocket.chat/cron it checkes for every 1 minnute
  cronJobs.add('sendScheduledMessages', '*/1 * * * *', async () => {
    console.log('Checking for scheduled messages...');
    const now = new Date();
    console.log('Current time:', now.toISOString()); // Log the current time for debugging

    // Find messages that are due to be sent
    const scheduledMessages = await ScheduledMessages.find({
      t: 'scheduled_message',
      scheduledAt: { $lte: now },
    }).fetchAsync(); // Use fetchAsync instead of toArray

    console.log(`Found ${scheduledMessages.length} scheduled messages to process`); // Log the number of messages found

    for (const message of scheduledMessages) {
      console.log(`Processing message ${message._id} scheduled for ${message.scheduledAt.toISOString()}`); // Log each message being processed
      try {
        // Update the message's timestamp to the scheduled time
        const updatedMessage = {
          ...message,
          ts: message.scheduledAt, // Set the timestamp to the scheduled time
          t: undefined, // Remove the scheduled_message type
          scheduledAt: undefined, // Remove the scheduledAt field
          _updatedAt: new Date(), // Update the _updatedAt field
        };

        // Insert the message into the Messages collection
        const result = await Messages.insertOne(updatedMessage);
        const messageId = result.insertedId;
        const createdMessage = await Messages.findOneById(messageId);
        if (!createdMessage) {
          console.error('Failed to find message after insertion:', messageId);
          continue;
        }

        // Send the message to the chat (this will broadcast it to clients)
        await executeSendMessage(message.u._id, createdMessage);

        // Remove the scheduled message from the ScheduledMessages collection
        await ScheduledMessages.removeAsync({ _id: message._id }); // Use removeAsync
        console.log(`Sent scheduled message ${message._id} at ${now.toISOString()}`);
      } catch (error) {
        console.error(`Failed to send scheduled message ${message._id}:`, error);
      }
    }
  });

  console.log('Scheduled messages cron job registered');
});