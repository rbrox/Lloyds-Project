import dotenv from 'dotenv';



export const PORT = process.env.PORT || 3000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-slots';
export const NODE_ENV = process.env.NODE_ENV || 'development';