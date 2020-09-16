import { Connection, createConnection } from 'mysql';
import dotEnv from 'dotenv';
import path from 'path';
dotEnv.config({path: path.join(__dirname, '..', '.env')});

let connection: Connection;

function handleDisconnect() {
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
}                                                    // the old one cannot be reused.

    connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
  }

  handleDisconnect();


export { connection }
