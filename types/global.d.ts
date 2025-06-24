import { Connection, Mongoose } from 'mongoose';

declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

export {}; 