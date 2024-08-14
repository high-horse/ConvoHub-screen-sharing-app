import { Ref } from "vue";

export enum EventType  {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  UPDATE_CLIENT = "UPDATE_CLIENT",
  PING = "PING",
  PONG = "PONG",
  NEW_CONNECTION = "NEW_CONNECTION",
  NEW_CONNECTION_TEXT = "NEW_CONNECTION_TEXT",
  CLIENT_READY = "CLIENT_READY",
  PEER_REQUEST_SEND = 'PEER_REQUEST_SEND',
  PEER_REQUEST_RESPONSE = 'PEER_REQUEST_RESPONSE',
  PEER_PAIRED = 'PEER_PAIRED',
  STREAM_IMAGE_PEER = 'STREAM_IMAGE_PEER',
};

export interface Event {
  type: keyof typeof EventType;
  payload: string;
}

export interface InputFieldProps {
  type: "text" | "password" | "email" | "number";
  name: string;
  id: string;
  placeholder?: string;
  required?: boolean;
  class?: string;
  modelValue: string;
}

export interface LabelProps {
  for: string;
  text: string;
  class?: string;
}

export const defaultInputClass =
  "bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

export const defaultLabelClass =
  "block mb-2 text-sm font-medium text-gray-900 dark:text-white";

export interface PairRequest {
	peerID: string,
	message: string,
	// message: PayloadMessage,
};

export interface PayloadMessage {
  Type: string,
  Status: boolean | string,
}
