import { BaseScene, Markup, Extra } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { cartao, boleto } from '../services/validate';

const paymentScene = new BaseScene('payment')
const NEXT_SCENE = process.env.SELECT_PLANO_FEATURE === 'true' ? 'plano' : 'name'

paymentScene.command('reiniciar', ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    CacheService.clearAllUserData()
    return ctx.scene.enter('welcome')
})

paymentScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    CacheService.clearAllUserData()
    return await ctx.scene.leave()
})

paymentScene.command('suporte', async ctx => {
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

paymentScene.action('cartao_de_credito', async (ctx) => {
    await ctx.answerCbQuery();
    await savePaymentMethod('cartao_de_credito');
    await askForPlano(ctx)
    await ctx.scene.enter(NEXT_SCENE);
})

paymentScene.action('boleto', async (ctx) => {
    await ctx.answerCbQuery();
    await savePaymentMethod('boleto');
    await askForPlano(ctx)
    await ctx.scene.enter(NEXT_SCENE);
})

paymentScene.use(async (ctx) => {
    if (cartao(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePaymentMethod('cartao_de_credito');
        await askForPlano(ctx);
        return await ctx.scene.enter(NEXT_SCENE);
    }
    if (boleto(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePaymentMethod('boleto');
        await askForPlano(ctx);
        return await ctx.scene.enter(NEXT_SCENE);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

const savePaymentMethod = async (paymentMethod) => {
    CacheService.savePaymentMethod(paymentMethod);
    log(`Forma de pagamento definida ${paymentMethod}`);
}

const showPlanoOptions = async (ctx) => {
    if (NEXT_SCENE === 'plano') {
        log(`Enviando opções de PLANO para ${ctx.chat.id}`)
        const planos = Markup.inlineKeyboard([
            [Markup.callbackButton('🥈 Prata/Silver', '78914')],
            [Markup.callbackButton('🥇 Gold', '90965')],
            [Markup.callbackButton('💎 Diamond', '90966')],
            [Markup.callbackButton('💎⬛ Black Diamond', '91261')]
        ])
        await ctx.reply("Qual foi o plano que você contratou?", Extra.markup(planos))
    }
}

const askForPlano = async (ctx) => {
    await ctx.reply('Certo!');
    await ctx.reply('Vou precisar de mais alguns dados pra confirmar o pagamento no servidor da Monetizze, tudo bem?');
    await showPlanoOptions(ctx);
}

export default paymentScene;
