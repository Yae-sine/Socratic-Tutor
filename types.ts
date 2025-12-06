export enum Sender {
  USER = 'user',
  BOT = 'model'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64 encoded string
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  attachment?: Attachment;
  timestamp: Date;
  isThinking?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}
