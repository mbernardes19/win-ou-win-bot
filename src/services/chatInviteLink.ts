import { Telegram } from 'telegraf';
import CacheService from '../services/cache';
import { log, logError, enviarMensagemDeErroAoAdmin } from '../logger';

const { ID_CANAL_TESTE } = process.env

let linkCanalTeste = ''

const exportChatsInviteLink = async () => {
    log(`🔗💬 GERANDO NOVOS LINKS PARA OS CHAT!`)
    try {
        const telegramClient = CacheService.get<Telegram>('telegramClient')
        linkCanalTeste = await telegramClient.exportChatInviteLink(ID_CANAL_TESTE)
        log(`🔗💬 LINKS PARA CHATS GERADOS!`)
        log(`🔗💬 TESTE: ${linkCanalTeste}`)
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
    switch(chatId) {
        case ID_CANAL_TESTE:
            return linkCanalTeste;
        default:
            throw new Error(`Chat buscado não existe ${chatId}`)
    }
}

export { getChatInviteLink, startChatLinkValidation }