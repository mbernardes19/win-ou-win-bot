const app = require('express')()
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const ngrok = require('ngrok');

async function runDeploy() {
    try {
        const {stdout, stderr} = await exec('pm2 restart main')
        console.log('stdout', stdout)
        console.log('stderr', stderr)
    } catch (err) {
        console.log(err)
    }
}

app.get('/', (req, res) => {
    console.log('GET /')
    res.send('Hello WIN WIN').status(200)
})
app.get('/revive', async (req, res) => {
    await runDeploy()
    res.sendStatus(200);
})

const PORT = process.env.PORT_TRADER_INFALIVEL_BOT_HEALTH_CHECKER || process.env.PORT_APP || 21571 || 3000
console.log('PORTA', PORT)
app.listen(PORT, () => console.log(`Health checker rodando na porta ${PORT}`));

(async () => {
    const url = await ngrok.connect(21571);
    console.log(url);
})()