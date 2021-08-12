export class Message {
  user: string;
  type: MessageType;
  clientid: string;
  message: string;
  date: Date;
}

export enum MessageType {
  Send='send',
  Receive='receive',
  UserLeft='userLeft'
}
