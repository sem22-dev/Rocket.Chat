
import type { IMessage, IUser } from '@rocket.chat/core-typings';

export interface IScheduledMessage extends Omit<IMessage, 't' | 'ts'> {
  t: 'scheduled_message';
  scheduledAt: Date;
  u: IUser;
  rid: string;
  msg: string;
  ts: Date;
  tmid?: string;
  _updatedAt: Date;
}