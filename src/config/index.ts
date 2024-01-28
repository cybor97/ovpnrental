export default {
  bot: {
    token: process.env.BOT_TOKEN,
  },
  loki: {
    host: process.env.LOKI_HOST,
    label: process.env.LOKI_LABEL,
    token: process.env.LOKI_TOKEN,
  },
  sqs: {
    region: process.env.SQS_REGION as string,
    accessKeyId: process.env.SQS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.SQS_SECRET_ACCESS_KEY as string,
    endpoint: process.env.SQS_ENDPOINT as string,
    agentQueueUrl: process.env.SQS_AGENT_QUEUE_URL as string,
    appQueueUrl: process.env.SQS_APP_QUEUE_URL as string,
  },
  scaleway: {
    accessKey: process.env.SCW_ACCESS_KEY as string,
    secretKey: process.env.SCW_SECRET_KEY as string,
    projectId: process.env.SCW_PROJECT_ID as string,
    secretId: process.env.SCW_SECRET_ID as string,
    region: process.env.SCW_REGION as string,
  },
  api: {
    internalJwtSecret: process.env.API_INTERNAL_JWT_SECRET as string,
    port: process.env.API_PORT ?? "8083",
  },
};
