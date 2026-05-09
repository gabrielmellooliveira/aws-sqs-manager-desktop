export interface SQSMessage {
  MessageId?: string
  ReceiptHandle?: string
  Body?: string
  Attributes?: Record<string, string>
  MessageAttributes?: Record<string, { StringValue?: string; DataType?: string }>
  MD5OfBody?: string
}

export interface SQSConfig {
  arn: string
  region?: string
  accessKeyId?: string
  secretAccessKey?: string
}

declare global {
  interface Window {
    sqsAPI: {
      start: (params: SQSConfig) => Promise<{ success: boolean; error?: string; queueUrl?: string }>
      stop: () => Promise<{ success: boolean }>
      onMessages: (callback: (messages: SQSMessage[]) => void) => () => void
      onError: (callback: (error: string) => void) => () => void
    }
  }
}
