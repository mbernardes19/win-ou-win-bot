import App, { Request, Response, Express } from "express";
import { Telegraf, Stage, session, Extra, Markup, Telegram } from 'telegraf';
import MainStage from './stages/MainStage';
import dotEnv from 'dotenv';
import { log, logError } from './logger';
import {getUserByTelegramId, updateViewChats, getAllUsers} from './dao';
import CacheService from "./services/cache";
import path from 'path';
dotEnv.config({path: path.join(__dirname, '..', '.env')});
import { startChatLinkValidation, exportChatsInviteLink } from './services/chatInviteLink';
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
        // if (dbUserResult.ver_canais >= 2) {
        //     return await ctx.reply('Você já visualizou os canais 2 vezes!');
        // }
        const user = User.fromDatabaseResult(dbUserResult);
        if (user.getUserData().statusAssinatura !== 'ativa') {
            return await ctx.reply('Você já ativou sua assinatura Eduzz comigo, porém seu status de assinatura na Eduzz não está como ativo, regularize sua situação com a Eduzz para ter acesso aos canais.');
        }
        const telegramClient = CacheService.get<Telegram>('telegramClient');
        await telegramClient.unbanChatMember(process.env.ID_CANAL_WIN_30, parseInt(user.getUserData().telegramId));
        await telegramClient.unbanChatMember(process.env.ID_CANAL_WIN_VIP, parseInt(user.getUserData().telegramId));
        await telegramClient.unbanChatMember(process.env.ID_CANAL_WIN_MIX, parseInt(user.getUserData().telegramId));
        await exportChatsInviteLink();
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

bot.command('tezte', async (ctx) => {
    const eduzzService = new EduzzService();
    const authCredentials: EduzzAuthCredentials = {email: 'contato.innovatemarketing@gmail.com', publicKey: '98057553', apiKey: '6d6f195185'}
    await eduzzService.authenticate(authCredentials);
    // const res = await getMonetizzeProductTransaction({email: 'feliperrocha@globo.com'})
    // res.dados.map(r => console.log(r))
    await bot.telegram.unbanChatMember(process.env.ID_CANAL_WIN_30, 1396772493);
    await bot.telegram.unbanChatMember(process.env.ID_CANAL_WIN_VIP, 1396772493);
    await bot.telegram.unbanChatMember(process.env.ID_CANAL_WIN_MIX, 1396772493);
    await bot.telegram.unbanChatMember(process.env.ID_CANAL_WIN_30, 1397179083);
    await bot.telegram.unbanChatMember(process.env.ID_CANAL_WIN_VIP, 1397179083);
    await bot.telegram.unbanChatMember(process.env.ID_CANAL_WIN_MIX, 1397179083);
    await bot.telegram.unbanChatMember(process.env.ID_CANAL_WIN_30, 1416003988);
    await bot.telegram.unbanChatMember(process.env.ID_CANAL_WIN_VIP, 1416003988);
    await bot.telegram.unbanChatMember(process.env.ID_CANAL_WIN_MIX, 1416003988);
    console.log('foi')
    // bot.telegram.kickChatMember(process.env.ID_CANAL_WIN_30, 1099938207);
    // bot.telegram.kickChatMember(process.env.ID_CANAL_WIN_VIP, 1099938207);
    // bot.telegram.kickChatMember(process.env.ID_CANAL_WIN_MIX, 1099938207);
    // await bot.telegram.sendMessage(721557882, 'Contato do suporte ⤵️', Extra.markup(teclado))

    // const res = await eduzzService.getPurchases({email: 'fswinerd@hotmail.com'})
    // res.data.map(r => console.log(r.content_id, r.content_title))
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