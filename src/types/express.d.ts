/* eslint-disable @typescript-eslint/no-empty-object-type */
import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
  }
}
