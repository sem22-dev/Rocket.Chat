import { Meteor } from 'meteor/meteor';
import { cronJobs } from '@rocket.chat/cron';
import { ScheduledMessages } from '../models/ScheduledMessages';
import { sendMessage } from '/app/lib/server/functions/sendMessage'; // Import sendMessage directly
import { Users } from '@rocket.chat/models';

Meteor.startup(() => {
  // Register the cron job with @rocket.chat/cron, it checks every 1 minute
  cronJobs.add('sendScheduledMessages', '*/1 * * * *', async () => {
    console.log('Checking for scheduled messages...');
    const now = new Date();
    console.log('Current time:', now.toISOString()); // Log the current time for debugging

    // Find messages that are due to be sent
    const scheduledMessages = await ScheduledMessages.find({
      t: 'scheduled_message',
      scheduledAt: { $lte: now },
    }).fetchAsync();

    console.log(`Found ${scheduledMessages.length} scheduled messages to process`);

    for (const message of scheduledMessages) {
      console.log(`Processing message ${message._id} scheduled for ${message.scheduledAt.toISOString()}`);
      try {
        // Fetch the user who scheduled the message
        const user = await Users.findOneById(message.u._id, {
          projection: { username: 1, type: 1, name: 1 },
        });
        if (!user) {
          console.error(`User ${message.u._id} not found for scheduled message ${message._id}`);
          continue;
        }

        // Construct the message object for sendMessage
        const messageToSend = {
          _id: message._id, // Use the scheduled message's ID
          rid: message.rid, // Room ID
          tmid: message.tmid, // Thread ID (if applicable)
          msg: message.msg, // Message text
          u: { _id: user._id, username: user.username }, // User info
          ts: message.scheduledAt, // Set the timestamp to the scheduled time
          _updatedAt: new Date(), // Update the _updatedAt field
        };

        // Send the message using sendMessage
        await sendMessage(user, messageToSend, { _id: message.rid }); // Pass a minimal room object with the rid

        // Remove the scheduled message from the ScheduledMessages collection
        await ScheduledMessages.removeAsync({ _id: message._id });
        console.log(`Sent scheduled message ${message._id} at ${now.toISOString()}`);
      } catch (error) {
        console.error(`Failed to send scheduled message ${message._id}:`, error);
      }
    }
  });

  console.log('Scheduled messages cron job registered');
});