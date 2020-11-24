import { Telegram } from 'telegraf';
import CacheService from '../services/cache';
import { log, logError, enviarMensagemDeErroAoAdmin } from '../logger';

const { ID_CANAL_WIN_30, ID_CANAL_WIN_VIP, ID_CANAL_WIN_MIX } = process.env

let linkCanalWin30 = ''
let linkCanalWinVip = ''
let linkCanalWinMix = ''

const exportChatsInviteLink = async () => {
    log(`🔗💬 GERANDO NOVOS LINKS PARA OS CHAT!`)
    try {
        const telegramClient = CacheService.get<Telegram>('telegramClient')
        linkCanalWin30 = await telegramClient.exportChatInviteLink(ID_CANAL_WIN_30)
        linkCanalWinVip = await telegramClient.exportChatInviteLink(ID_CANAL_WIN_VIP)
        linkCanalWinMix = await telegramClient.exportChatInviteLink(ID_CANAL_WIN_MIX)
        log(`🔗💬 LINKS PARA CHATS GERADOS!`)
    } catch (err) {
        logError(`ERRO AO GERAR NOVOS LINKS PARA CHATS`, err)
        await enviarMensagemDeErroAoAdmin(`ERRO AO GERAR NOVOS LINKS PARA CHATS`, err)
    }
}

const startChatLinkValidation = () => {
    log(`VALIDAÇÃO DE LINKS INICIADA!`);
    exportChatsInviteLink();
    setInterval(async () => await exportChatsInviteLink(), 300000)
}

const getChatInviteLink = (chatId: number|string) => {
    log(`Pegando link para chat ${chatId}`)
    console.log(chatId, ID_CANAL_WIN_30)
    switch(chatId) {
        case parseInt(ID_CANAL_WIN_30):
            return {name: 'WIN 30', invite: linkCanalWin30};
        case parseInt(ID_CANAL_WIN_VIP):
            return {name: 'WIN VIP', invite: linkCanalWinVip};
        case parseInt(ID_CANAL_WIN_MIX):
            return {name: 'WIN MIX', invite: linkCanalWinMix};
        default:
            throw new Error(`Chat buscado não existe ${chatId}`)
    }
}

export { getChatInviteLink, startChatLinkValidation }