declare module "telegraf-ratelimit" {
  export default function rateLimit(options: {
    window: number;
    limit: number;
    onLimitExceeded?: (ctx: any) => void;
    keyGenerator?: (ctx: any) => string;
  }): (ctx: any, next: () => Promise<any>) => Promise<any>;
}
