import App, { Request, Response, Express } from "express";
import { Telegraf, Stage, session, Extra, Markup } from 'telegraf';
import MainStage from './stages/MainStage';
import dotEnv from 'dotenv';
import { log, logError } from './logger';
import {getUserByTelegramId, updateViewChats} from './dao';
import CacheService from "./services/cache";
import path from 'path';
dotEnv.config({path: path.join(__dirname, '..', '.env')});
import { startChatLinkValidation } from './services/chatInviteLink';
import { connection } from "./db";
import { getChats } from './services/chatResolver';
import { getChatInviteLink } from './services/chatInviteLink';
import User from "./model/User";
import { startCronJobs } from './services/cronjobs';
import { getMonetizzeProductTransaction } from './services/request'
import ngrok from 'ngrok';

    const botToken = process.env.NODE_ENV === 'production' ? process.env.BOT_TOKEN : process.env.TEST_BOT_TOKEN;
    const bot = new Telegraf(botToken);

CacheService.save('telegramClient', bot.telegram);

startChatLinkValidation();
startCronJobs();

bot.use(session())
bot.use(MainStage.middleware())
bot.command('start', Stage.enter('welcome'))
bot.command('reiniciar', Stage.enter('welcome'))
bot.command('canais', async ctx => {
    log(`Usuário ${ctx.chat.id} solicitou ver os canais disponíveis`);
    try {
        const dbUserResult = await getUserByTelegramId(ctx.chat.id, connection);
        if (!dbUserResult) {
            return await ctx.reply('Você ainda não ativou sua assinatura Monetizze comigo.');
        }
        if (dbUserResult.ver_canais >= 2) {
            return await ctx.reply('Você já visualizou os canais 2 vezes!');
        }
        const user = User.fromDatabaseResult(dbUserResult);
        if (user.getUserData().statusAssinatura !== 'ativa') {
            return await ctx.reply('Você já ativou sua assinatura Monetizze comigo, porém seu status de assinatura na Monetizze não está como ativo, regularize sua situação com a Monetizze para ter acesso aos canais.');
        }
        const { plano } = user.getUserData()
        const chats = getChats(plano);
        const invites = chats.map(chat => getChatInviteLink(chat))
        const teclado = Markup.inlineKeyboard(invites.map(invite => Markup.urlButton(invite.name, invite.invite)));
        await ctx.reply('É pra já!', Extra.markup(teclado))
        await updateViewChats(ctx.chat.id, connection);
    } catch (err) {
        logError(`ERRO AO ENVIAR CANAIS DISPONÍVEIS POR COMANDO PARA USUÁRIO ${ctx.chat.id}`, err)
        await ctx.reply('Ocorreu um erro ao verificar sua assinatura Monetizze. Tente novamente mais tarde.')
    }
});

bot.command('t35t3', async (ctx) => {
    // bot.telegram.kickChatMember(process.env.ID_CANAL_WIN_30, 1099938207);
    // bot.telegram.kickChatMember(process.env.ID_CANAL_WIN_VIP, 1099938207);
    // bot.telegram.kickChatMember(process.env.ID_CANAL_WIN_MIX, 1099938207);
    // await bot.telegram.sendMessage(721557882, 'Contato do suporte ⤵️', Extra.markup(teclado))
});

bot.command('suporte', async (ctx) => {
    const teclado = Markup.inlineKeyboard([
        [Markup.urlButton('👉 SUPORTE', 't.me/winouwin')]
    ]);
    await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(teclado))
});

bot.on('message', async ctx => {
    if (ctx.chat.id === parseInt(process.env.ID_CANAL_WIN_30, 10)) {
        return;
    }
    if (ctx.chat.id === parseInt(process.env.ID_CANAL_WIN_VIP, 10)) {
        return;
    }
    if (ctx.chat.id === parseInt(process.env.ID_CANAL_WIN_MIX, 10)) {
        return;
    }
    try {
        await ctx.reply('Olá, sou o Bot do Win ou Win 🤖💵!\nSegue abaixo meus comandos:\n\n/start - Começar nossa conversa\n/parar - Parar nossa conversa\n/reiniciar - Começar nossa conversa do zero\n/suporte - Entrar em contato com o suporte')
    } catch (err) {
        console.log(err)
    }
})
bot.launch()

const app: Express = App();

app.get('/', (req: Request, res: Response) => {
    res.send('Olá!');
});
const PORT = process.env.PORT_TRADER_INFALIVEL_BOT_DIST_MAIN || process.env.PORT_MAIN || 3001
console.log('PORTA', PORT)
app.listen(PORT, () => log('conectado na porta 3001'))

