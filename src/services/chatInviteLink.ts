import { Telegram } from 'telegraf';
import CacheService from '../services/cache';
import { log, logError, enviarMensagemDeErroAoAdmin } from '../logger';

const { ID_CANAL_GERAL, ID_CANAL_SILVER, ID_CANAL_GOLD, ID_CANAL_DIAMOND, ID_GRUPO_BLACK_DIAMOND } = process.env

let linkCanalGeral = ''
let linkCanalSilver = ''
let linkCanalGold = ''
let linkCanalDiamond = ''
let linkGrupoBlackDiamond = ''

const exportChatsInviteLink = async () => {
    log(`🔗💬 GERANDO NOVOS LINKS PARA OS CHAT!`)
    try {
        const telegramClient = CacheService.get<Telegram>('telegramClient')
        linkCanalGeral = await telegramClient.exportChatInviteLink(ID_CANAL_GERAL)
        linkCanalSilver = await telegramClient.exportChatInviteLink(ID_CANAL_SILVER)
        linkCanalGold = await telegramClient.exportChatInviteLink(ID_CANAL_GOLD)
        linkCanalDiamond = await telegramClient.exportChatInviteLink(ID_CANAL_DIAMOND)
        linkGrupoBlackDiamond = await telegramClient.exportChatInviteLink(ID_GRUPO_BLACK_DIAMOND)
        log(`🔗💬 LINKS PARA CHATS GERADOS!`)
        log(`🔗💬 GERAL: ${linkCanalGeral}, SILVER: ${linkCanalSilver}, GOLD: ${linkCanalGold}, DIAMOND: ${linkCanalDiamond}, BLACK DIAMOND: ${linkGrupoBlackDiamond}`)
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
        case ID_CANAL_GERAL:
            return linkCanalGeral;
        case ID_CANAL_SILVER:
            return linkCanalSilver;
        case ID_CANAL_GOLD:
            return linkCanalGold;
        case ID_CANAL_DIAMOND:
            return linkCanalDiamond;
        case ID_GRUPO_BLACK_DIAMOND:
            return linkGrupoBlackDiamond;
        default:
            throw new Error(`Chat buscado não existe ${chatId}`)
    }
}

export { getChatInviteLink, startChatLinkValidation }