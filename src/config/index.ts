export default {
  bot: {
    token: process.env.BOT_TOKEN,
  },
  sqs: {
    region: process.env.SQS_REGION as string,
    accessKeyId: process.env.SQS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.SQS_SECRET_ACCESS_KEY as string,
    endpoint: process.env.SQS_ENDPOINT as string,
    agentQueueUrl: process.env.SQS_AGENT_QUEUE_URL as string,
    appQueueUrl: process.env.SQS_APP_QUEUE_URL as string,
  },
};
