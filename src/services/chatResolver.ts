import { Planos } from '../model/Planos';
import { log, logError } from '../logger';

export function getChats(plano: string): number[] {
    let chatsInfo: number[] = []
    log(`💬 Pegando canal para plano ${plano}`)
    if (process.env.NODE_ENV === 'production') {
        switch(plano) {
            case Planos.START:
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_30))
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_MIX))
                break;
            case Planos.PREMIUM:
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_30))
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_MIX))
                break;
            case Planos.MASTER:
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_30))
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_MIX))
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_VIP))
                break;
            default:
                throw new Error(`Plano ${plano} não existe`)
        }
    } else {
        switch(plano) {
            case Planos.START:
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_30))
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_MIX))
                break;
            case Planos.PREMIUM:
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_30))
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_MIX))
                break;
            case Planos.MASTER:
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_30))
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_MIX))
                chatsInfo.push(parseInt(process.env.ID_CANAL_WIN_VIP))
                break;
            default:
                throw new Error(`Plano ${plano} não existe`)
        }
    }
    return chatsInfo;
}
