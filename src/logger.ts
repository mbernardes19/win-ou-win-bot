import { Telegram } from "telegraf";
import CacheService from './services/cache';

const logError = (message: string|string[], error: any) => {
    const time = getTimeString();
    console.log(time, 'ERROR', message, error);
}

const enviarMensagemDeErroAoAdmin = async (mensagemErro: string, erro: any) => {
    let telegramClient;
    try {
        telegramClient = CacheService.get<Telegram>('telegramClient');
        await telegramClient.sendMessage('721557882', `${mensagemErro}\n\n${erro}`);
    } catch (err) {
        logError(`ERRO AO ENVIAR MENSAGEM DE ERRO AO ADMIN`, err);
    }
}

const logWarning = (message: string|string[]) => {
    const time = getTimeString();
    console.log(time, 'WARNING', message);
}
const log = (message: any) => {
    const time = getTimeString();
    console.log(time, 'INFO', message);
}

const getTimeString = (): string => {
    const date = new Date();
    const day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth()+1}` : `${date.getMonth()+1}`;
    const year = `${date.getFullYear()}`;
    const hour = date.getHours() < 10 ? `0${date.getHours()}` : `${date.getHours()}`;
    const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
    const second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : `${date.getSeconds()}`;
    const millisseconds = date.getMilliseconds() < 10 ? `0${date.getMilliseconds()}` : `${date.getMilliseconds()}`;
    return `[${day}-${month}-${year} ${hour}:${minute}:${second}::${millisseconds}]`;
}

export { log, logWarning, logError, enviarMensagemDeErroAoAdmin }