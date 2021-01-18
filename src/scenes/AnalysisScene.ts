import { BaseScene, Markup, Extra, Telegram } from 'telegraf';
import CacheService from '../services/cache';
// import { verifyUserPurchase, checkIfPaymentMethodIsBoleto, getDataAssinaturaFromUser, confirmPlano } from '../services/monetizze';
import UserData from '../model/UserData';
import User from '../model/User';
import { logError, log, enviarMensagemDeErroAoAdmin } from '../logger';
import { addUserToDatabase, getUserByTelegramId } from '../dao';
import { connection } from '../db';
import { getChats } from '../services/chatResolver';
import { getChatInviteLink, exportChatsInviteLink } from '../services/chatInviteLink';
import { SceneContextMessageUpdate, Scene } from 'telegraf/typings/stage';
import EduzzService from '../services/eduzz';
import { EduzzAuthCredentials } from '../interfaces/Eduzz';

const analysisScene = new BaseScene('analysis')
const eduzzService = new EduzzService();

analysisScene.command('reiniciar', ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {};
    return ctx.scene.enter('welcome', ctx.scene.state)
})

analysisScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {};
    return await ctx.scene.leave()
})

analysisScene.command('suporte', async ctx => {
    log(`Enviando suporte para ${ctx.chat.id}`)
    const teclado = Markup.inlineKeyboard([
        [Markup.urlButton('👉 SUPORTE', 't.me/winouwin')]
    ]);
    await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(teclado))
    ctx.scene.session.state = {};
    return await ctx.scene.leave()
})

analysisScene.enter(async (ctx) => {
    const authCredentials: EduzzAuthCredentials = {email: 'contato.innovatemarketing@gmail.com', publicKey: '98057553', apiKey: '6d6f195185'}
    await eduzzService.authenticate(authCredentials)
    await ctx.reply('Verificando sua compra nos servidores da Eduzz...');
    const email = ctx.scene.session.state['email'];
    let isPurchaseApproved;
    try {
        log(`Iniciando análise de compra ${ctx.chat.id}`)
        isPurchaseApproved = await eduzzService.verifyUserPurchase(email);
        if (isPurchaseApproved) {
            log(`Compra confirmada! ${ctx.chat.id}`)
        }
    } catch (err) {
        logError(`Erro ao verificar compra de usuário na Eduzz`, err)
        await enviarMensagemDeErroAoAdmin(`Erro ao verificar compra de usuário na Eduzz`, err);
        await ctx.reply('Me desculpe... Ocorreu um erro ao verificar a sua compra na Eduzz. Por favor, tente iniciar uma conversa comigo novamente.');
        return await endConversation(ctx);
    }

    if (isPurchaseApproved) {
        const isPlanoConfirmed = await eduzzService.confirmProduct(email, ctx.scene.session.state['plano'])
        if (isPlanoConfirmed) {
            log(`Compra e plano de ${ctx.chat.id} foram confirmados!`)
            const userData = await getUserData(ctx);
            try {
                const newUser = new User(userData);
                await saveUser(newUser);
                await enviarCanaisDeTelegram(ctx, userData.plano, userData.dataAssinatura);
                await endConversation(ctx);
            } catch (err) {
                if (err.errno === 1062) {
                    logError(`Usuário já existe no banco de dados`, err);
                    await enviarMensagemDeErroAoAdmin(`Usuário já existe no banco de dados`, err);
                    const dbUserResult = await getUserByTelegramId(userData.telegramId, connection)
                    const user = User.fromDatabaseResult(dbUserResult);
                    await ctx.reply(`Você já ativou sua assinatura Eduzz comigo antes.`)
                    if (user.getUserData().statusAssinatura === 'ativa') {
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
                            await ctx.reply(
                                `Caso não tenha conseguido acessar o canal, estou te enviando os botões de acesso novamente:`,
                                Extra.markup(teclado)
                            );
                        } else {
                            const chats = getChats(plano);
                            const invites = chats.map(chat => getChatInviteLink(chat))
                            const teclado = Markup.inlineKeyboard(invites.map(invite => Markup.urlButton(invite.name, invite.invite)));
                            await ctx.reply(
                                `Caso não tenha conseguido acessar o canal, estou te enviando os botões de acesso novamente:`,
                                Extra.markup(teclado)
                            );
                        }
                    }
                    return await endConversation(ctx);
                } else {
                    logError(`Erro genérico`, err)
                    await ctx.reply(`Sua compra na Eduzz foi confirmada, porém ocorreu um erro ao ativar sua assinatura na Eduzz.`)
                    return await endConversation(ctx);
                }
            }
        } else {
            await ctx.reply(`Sua compra na Eduzz foi confirmada, porém o plano que você selecionou não é o mesmo que consta nela.\nPor favor, inicie uma conversa comigo novamente com o comando /start e infome o plano correto.`)
            return await endConversation(ctx);
        }
    } else {
        let isPaymentBoleto;
        try {
            isPaymentBoleto = await eduzzService.checkIfPaymentMethodIsBoleto(email);
        } catch (err) {
            logError(`ERRO AO VERIFICAR SE PAGAMENTO FOI FEITO NO BOLETO E ESTÁ AGUARDANDO PAGAMENTO`, err)
            await enviarMensagemDeErroAoAdmin(`ERRO AO VERIFICAR SE PAGAMENTO FOI FEITO NO BOLETO E ESTÁ AGUARDANDO PAGAMENTO`, err);
            await ctx.reply('Desculpe, ocorreu um erro ao verificar se pagamento foi feito no boleto. Tente iniciar uma conversa comigo novamente usando o comando /reiniciar')
        }
        if (isPaymentBoleto) {
            log(`Pagamento de ${ctx.chat.id} foi em boleto e está aguardando pagamento`)
            await ctx.reply('Sua compra foi iniciada, porém o seu boleto ainda não foi pago/compensado. Você pode ver o status do seu boleto acessando eduzz.com.br . Quando estiver compensado volte e inicie uma conversa comigo novamente!')
            return await endConversation(ctx);
        }
        log(`Nenhuma compra feita pelo usuário ${ctx.chat.id} foi encontrada`)
        await ctx.reply('Nenhuma compra confirmada do seu usuário foi encontrada na Eduzz ou sua assinatura não está com status ativo.\n\nSe você realmente comprou, entre em contato com o suporte usando o comando /suporte')
        return await endConversation(ctx);
    }
})

const getUserDataAssinatura = async (ctx: SceneContextMessageUpdate) => {
    const email = ctx.scene.session.state['email'];
    try {
        return await eduzzService.getUserSubscriptionDate(email);
    } catch (err) {
        throw err;
    }
}

const getUserData = async (ctx: SceneContextMessageUpdate): Promise<UserData> => {
    log(`Pegando dados de usuário ${ctx.chat.id}`);
    try {
        const userData: UserData = new UserData();
        const telegramClient = CacheService.get<Telegram>('telegramClient');
        const chat = await telegramClient.getChat(ctx.chat.id)
        userData.telegramId = ctx.chat.id.toString();
        userData.discountCouponId = '0';
        userData.username = chat.username;
        userData.paymentMethod = ctx.scene.session.state['paymentMethod'];
        userData.plano = ctx.scene.session.state['plano'];
        userData.fullName = ctx.scene.session.state['fullName'];
        userData.phone = ctx.scene.session.state['phone'];
        userData.email = ctx.scene.session.state['email'];
        userData.dataAssinatura = await getUserDataAssinatura(ctx);
        userData.diasAteFimDaAssinatura = 0;

        log(`Username Telegram definido ${userData.username}`)
        log(`Id Telegram definido ${userData.telegramId}`)
        log(`Cupom de desconto definido ${userData.discountCouponId}`)
        log(`Data de assinatura definida ${userData.dataAssinatura}`)

        return userData;
    } catch (err) {
        logError(`ERRO AO PEGAR DADOS DE USUÁRIO ${ctx.chat.id}`, err);
        await enviarMensagemDeErroAoAdmin(`ERRO AO PEGAR DADOS DE USUÁRIO ${ctx.chat.id}`, err);

    }
}

const saveUser = async (newUser: User) => {
    try {
        log(`Adicionando usuário ${newUser.getUserData().telegramId} ao banco de dados`)
        await addUserToDatabase(newUser, connection)
    } catch (err) {
        logError(`ERRO AO SALVAR USUÁRIO NO BANCO DE DADOS ${newUser.getUserData().telegramId}`, err)
        await enviarMensagemDeErroAoAdmin(`ERRO AO SALVAR USUÁRIO NO BANCO DE DADOS ${newUser.getUserData().telegramId}`, err);
        throw err;
    }
}

const enviarCanaisDeTelegram = async (ctx: SceneContextMessageUpdate, plano: string, dataAssinatura: string) => {
    let links: number[];
    let chatInvites;
    log(`Enviando canais de Telegram para usuário ${ctx.chat.id}`)
    try {
        links = getChats(ctx.scene.session.state['plano'])
        chatInvites = links.map(link => getChatInviteLink(link))
    } catch (err) {
        logError(`ERRO AO ENVIAR CANAIS DE TELEGRAM`, err)
        await enviarMensagemDeErroAoAdmin(`ERRO AO ENVIAR CANAIS DE TELEGRAM`, err);
        throw err;
    }

    log(`Canais enviados para ${ctx.chat.id}`)

    const invites = chatInvites.map(chatInvite => Markup.urlButton(chatInvite.name, chatInvite.invite))

    const teclado = Markup.inlineKeyboard(invites)
    await ctx.reply('Seja bem-vindo(a)!')
    await ctx.reply('Clique agora nos botões e acesse nossos canais o quanto antes, logo eles vão expirar ⤵️', Extra.markup(teclado))
    return await ctx.replyWithMarkdown('Caso eles já tenham expirado quando você clicar, utilize o comando /canais para recebê-los atualizados!\n\n*OBS.: Você só pode receber os canais por esse comando 2 vezes.*');
}

const endConversation = async (ctx) => {
    log(`Conversa com ${ctx.chat.id} finalizada`)
    ctx.scene.session.state = {};
    return ctx.scene.leave();
}

export default analysisScene;