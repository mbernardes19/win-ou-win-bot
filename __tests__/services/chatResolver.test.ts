import {getChats} from '../../src/services/chatResolver';
import { Planos } from '../../src/model/Planos';

beforeEach(() => {
    process.env.ID_CANAL_WIN_30 = '-100123';
    process.env.ID_CANAL_WIN_MIX = '-1001234';
    process.env.ID_CANAL_WIN_VIP = '-10012345';
})

describe('Chat Resolver', () => {
    it('Should return chats for plano WIN START', () => {
        const chats = getChats(Planos.START)
        expect(chats[0]).toBe(-100123)
        expect(chats[1]).toBe(-1001234)
        expect(chats.length).toBe(2);
    })

    it('Should return chats for plano WIN PREMIUM', () => {
        const chats = getChats(Planos.PREMIUM)
        expect(chats[0]).toBe(-100123)
        expect(chats[1]).toBe(-1001234)
        expect(chats.length).toBe(2);
    })

    it('Should return chats for plano WIN VIP', () => {
        const chats = getChats(Planos.VIP)
        expect(chats[0]).toBe(-100123)
        expect(chats[1]).toBe(-1001234)
        expect(chats[2]).toBe(-10012345)
        expect(chats.length).toBe(3);
    })
})