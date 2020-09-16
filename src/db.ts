import { Connection, createConnection } from 'mysql';
import dotEnv from 'dotenv';
import path from 'path';
dotEnv.config({path: path.join(__dirname, '..', '.env')});

let connection: Connection;

if (process.env.NODE_ENV === 'production') {
    connection = createConnection({
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dateStrings: true
    })
} else {
    connection = createConnection({
        host: process.env.DB_TEST_HOST,
        database: process.env.DB_TEST_DATABASE,
        user: process.env.DB_TEST_USER,
        password: process.env.DB_TEST_PASSWORD,
        dateStrings: true
    })
}

export { connection }
