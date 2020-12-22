import App, { Request, Response, Express } from "express";
import { Telegraf, Stage, session, Extra, Markup } from 'telegraf';
import MainStage from './stages/MainStage';
import dotEnv from 'dotenv';
import { log, logError } from './logger';
import {getUserByTelegramId, updateViewChats, getAllUsers} from './dao';
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
import EduzzService from "./services/eduzz";
import { EduzzAuthCredentials } from "./interfaces/Eduzz";

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
    // const eduzzService = new EduzzService();
    // const authCredentials: EduzzAuthCredentials = {email: 'contato.innovatemarketing@gmail.com', publicKey: '98057553', apiKey: '6d6f195185'}
    // await eduzzService.authenticate(authCredentials)
    // const res = await eduzzService.getPurchases({})
    // console.log(res.data[0])
    // console.log(res.data[1])
    // console.log(res.data[2])
    // console.log(res.data[3])
    try {
        const dbUserResult = await getUserByTelegramId(ctx.chat.id, connection);
        if (!dbUserResult) {
            return await ctx.reply('Você ainda não ativou sua assinatura Eduzz comigo.');
        }
        if (dbUserResult.ver_canais >= 2) {
            return await ctx.reply('Você já visualizou os canais 2 vezes!');
        }
        const user = User.fromDatabaseResult(dbUserResult);
        if (user.getUserData().statusAssinatura !== 'ativa') {
            return await ctx.reply('Você já ativou sua assinatura Eduzz comigo, porém seu status de assinatura na Eduzz não está como ativo, regularize sua situação com a Eduzz para ter acesso aos canais.');
        }
        const { plano } = user.getUserData()
        if (plano === '' || plano === 'undefined' || plano === undefined || plano === null) {
            const win30 = getChatInviteLink(parseInt(process.env.ID_CANAL_WIN_30))
            const winMix = getChatInviteLink(parseInt(process.env.ID_CANAL_WIN_MIX))
            const winVip = getChatInviteLink(parseInt(process.env.ID_CANAL_WIN_VIP))

            const teclado = Markup.inlineKeyboard([
                [{text: win30.name, url: win30.invite}],
                [{text: winMix.name, url: winMix.invite}],
                [{text: winVip.name, url: winVip.invite}]
            ]);
            await ctx.reply('É pra já!', Extra.markup(teclado))
            await updateViewChats(ctx.chat.id, connection);   
        } else {
            const chats = getChats(plano);
            const invites = chats.map(chat => getChatInviteLink(chat))
            const teclado = Markup.inlineKeyboard(invites.map(invite => Markup.urlButton(invite.name, invite.invite)));
            await ctx.reply('É pra já!', Extra.markup(teclado))
            await updateViewChats(ctx.chat.id, connection);   
        }
    } catch (err) {
        logError(`ERRO AO ENVIAR CANAIS DISPONÍVEIS POR COMANDO PARA USUÁRIO ${ctx.chat.id}`, err)
        await ctx.reply('Ocorreu um erro ao verificar sua assinatura Eduzz. Tente novamente mais tarde.')
    }
});

bot.command('t35t3', async (ctx) => {
    // const res = await getMonetizzeProductTransaction({email: 'feliperrocha@globo.com'})
    // res.dados.map(r => console.log(r))
    // bot.telegram.kickChatMember(process.env.ID_CANAL_WIN_30, 1099938207);
    // bot.telegram.kickChatMember(process.env.ID_CANAL_WIN_VIP, 1099938207);
    // bot.telegram.kickChatMember(process.env.ID_CANAL_WIN_MIX, 1099938207);
    // await bot.telegram.sendMessage(721557882, 'Contato do suporte ⤵️', Extra.markup(teclado))
    const users = await getAllUsers(connection);
    const asyncActions = [];
    const message = `Boa noite! Ocorreu um bug nos canais do Win ou Win e muitas pessoas acabaram sendo removidas dos canais por engano. Para garantir que você não perca o acesso aos nossos canais, estou te enviando novamente o acesso a eles:`
    const message2 = `Caso não consiga acessar através desses botões, utilize o comando /canais para recebê-los novamente.`
    await bot.telegram.sendMessage(721557882, message2)
    users.forEach(user => {
        if (user.plano === '' || user.plano === 'undefined') {
            const win30 = getChatInviteLink(parseInt(process.env.ID_CANAL_WIN_30))
            const winMix = getChatInviteLink(parseInt(process.env.ID_CANAL_WIN_MIX))
            const winVip = getChatInviteLink(parseInt(process.env.ID_CANAL_WIN_VIP))
            asyncActions.push(bot.telegram.sendMessage(user.id_telegram, message, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: win30.name, url: win30.invite}],
                        [{text: winMix.name, url: winMix.invite}],
                        [{text: winVip.name, url: winVip.invite}],
                    ]
                }
            }))
            asyncActions.push(bot.telegram.sendMessage(user.id_telegram, message2))
        } else {
            const chats = getChats(user.plano)
            const invites = chats.map(chat => getChatInviteLink(chat))
            asyncActions.push(bot.telegram.sendMessage(user.id_telegram, message, {
                reply_markup: {
                    inline_keyboard: [
                        invites.map(invite => ({text: invite.name, url: invite.invite}))
                    ]
                }
            }))
            asyncActions.push(bot.telegram.sendMessage(user.id_telegram, message2))
        }
    })
    try {
        const res = await Promise.allSettled(asyncActions)
        res.forEach(re => console.log(re))
    } catch (err) {
        console.log('ERRO', err)
    }
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
const PORT = process.env.PORT_TRADER_INFALIVEL_BOT_DIST_MAIN || process.env.PORT_MAIN || 3000
console.log('PORTA', PORT)
app.listen(PORT, () => log('conectado na porta 3000'))