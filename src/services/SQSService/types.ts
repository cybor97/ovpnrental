export interface SQSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  emitterQueueUrl: string;
  consumerQueueUrl: string;
}
