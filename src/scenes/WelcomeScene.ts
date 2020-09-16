import { BaseScene, Markup, Extra } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';

const welcomeScene = new BaseScene('welcome')

welcomeScene.command('reiniciar', async ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    if (ctx.chat.id === parseInt(process.env.ID_GRUPO_BLACK_DIAMOND, 10)) {
        return await ctx.scene.leave();
    }
    CacheService.clearAllUserData()
    return await ctx.scene.enter('welcome')
})

welcomeScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    CacheService.clearAllUserData()
    return await ctx.scene.leave()
})

welcomeScene.command('suporte', async ctx => {
    log(`Enviando suporte para ${ctx.chat.id}`)
    const teclado = Markup.inlineKeyboard([
        [Markup.urlButton('👉 SUPORTE 1', 't.me/juliasantanana')],
        [Markup.urlButton('👉 SUPORTE 2', 't.me/diego_sti')],
        [Markup.urlButton('👉 SUPORTE 3', 't.me/julianocba')],
    ]);
    await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(teclado))
    CacheService.clearAllUserData()
    return await ctx.scene.leave()
})

welcomeScene.enter(async (ctx) => {
    if (ctx.chat.id === parseInt(process.env.ID_GRUPO_BLACK_DIAMOND, 10)) {
        return await ctx.scene.leave();
    }
    await welcome(ctx);
    await showPaymentOptions(ctx);
    await ctx.scene.enter('payment')
})

const welcome = async (ctx) => {
    log(`Enviando boas vindas para ${ctx.chat.id}`)
    await ctx.reply('Olá, eu sou o Bot do Win ou Win 🤖💵 Estou aqui para te dar acesso aos nossos canais de Telegram para que você possa começar a trilhar seu caminho rumo à riqueza!');
    await ctx.reply('Preciso primeiramente confirmar no servidor da Monetizze se o seu pagamento já foi aprovado.\n\nPor isso, gostaria de saber algumas informações de você...');
}

const showPaymentOptions = async (ctx) => {
    log(`Enviando opções de PAGAMENTO para ${ctx.chat.id}`)
    const pagamento = Markup.inlineKeyboard([
        [Markup.callbackButton('💳 Cartão de Crédito', 'cartao_de_credito')],
        [Markup.callbackButton('📄 Boleto', 'boleto')]
    ])
    await ctx.reply("Qual foi sua forma de pagamento?", Extra.markup(pagamento))
}

export default welcomeScene;