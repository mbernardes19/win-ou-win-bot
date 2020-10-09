const app = require('express')()
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const ngrok = require('ngrok');
const mysql = require('mysql2');
const dotenv = require('dotenv').config();

async function runDeploy() {
    try {
        const {stdout, stderr} = await exec('pm2 restart main')
        console.log('stdout', stdout)
        console.log('stderr', stderr)
    } catch (err) {
        try {
            console.log(err)
            const {stdout, stderr} = await exec('nvm use 12.18.4 && pm2 restart main')
            console.log('stdout', stdout)
            console.log('stderr', stderr)
        } catch (err) {
            console.log(err);
        }
    }
}

(async () => {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dateStrings: true
    })
    const query = util.promisify(connection.query).bind(connection)
    const url = await ngrok.connect({authtoken: '1iZM941vpA0t6pM9Yongcnp6vmS_2FLBEysByJ3ijLvEQo6Tj', addr: 3001});
    await query(`update URLs set url='${url}' where id=1`);
    connection.end();

    console.log(url);

    app.get('/', (req, res) => {
        console.log('GET /')
        res.send('Hello WIN WIN').status(200)
    })
    app.get('/revive', async (req, res) => {
        await runDeploy()
        res.sendStatus(200);
    })
    
    const PORT = process.env.PORT_TRADER_INFALIVEL_BOT_HEALTH_CHECKER || process.env.PORT_APP || 3001
    console.log('PORTA', PORT)
    app.listen(PORT, () => console.log(`Health checker rodando na porta ${PORT}`));
})()