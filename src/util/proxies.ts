import { RequestHandler } from 'express';

export const proxies = new Map<string, RequestHandler>();
