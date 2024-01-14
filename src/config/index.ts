export default {
  bot: {
    token: process.env.BOT_TOKEN,
  },
  nats: {
    server: process.env.NATS_SERVER,
    username: process.env.NATS_USERNAME,
    jwt: process.env.NATS_JWT,
    nkeySeed: process.env.NATS_NKEY_SEED,
  },
};
