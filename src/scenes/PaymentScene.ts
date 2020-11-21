import { BaseScene, Markup, Extra } from 'telegraf';
import { log } from '../logger';
import { cartao, boleto } from '../services/validate';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

const paymentScene = new BaseScene('payment')
const NEXT_SCENE = process.env.SELECT_PLANO_FEATURE === 'true' ? 'plano' : 'name'

paymentScene.command('reiniciar', ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {}
    return ctx.scene.enter('welcome', ctx.scene.state)
})

paymentScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {}
    return await ctx.scene.leave()
})

paymentScene.command('suporte', async ctx => {
    log(`Enviando suporte para ${ctx.chat.id}`)
    const teclado = Markup.inlineKeyboard([
        [Markup.urlButton('👉 SUPORTE', 't.me/winouwin')]
    ]);
    await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(teclado))
    ctx.scene.session.state = {}
    return await ctx.scene.leave()
})

paymentScene.action('cartao_de_credito', async (ctx) => {
    await ctx.answerCbQuery();
    await savePaymentMethod('cartao_de_credito', ctx);
    await askForPlano(ctx)
    await ctx.scene.enter(NEXT_SCENE, ctx.scene.state);
})

paymentScene.action('boleto', async (ctx) => {
    await ctx.answerCbQuery();
    await savePaymentMethod('boleto', ctx);
    await askForPlano(ctx)
    await ctx.scene.enter(NEXT_SCENE, ctx.scene.state);
})

paymentScene.use(async (ctx) => {
    if (cartao(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePaymentMethod('cartao_de_credito', ctx);
        await askForPlano(ctx);
        return await ctx.scene.enter(NEXT_SCENE, ctx.scene.state);
    }
    if (boleto(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePaymentMethod('boleto', ctx);
        await askForPlano(ctx);
        return await ctx.scene.enter(NEXT_SCENE, ctx.scene.state);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

const savePaymentMethod = async (paymentMethod, ctx: SceneContextMessageUpdate) => {
    ctx.scene.session.state = {...ctx.scene.session.state, paymentMethod};
    log(`Forma de pagamento definida ${paymentMethod}`);
}

const showPlanoOptions = async (ctx) => {
    if (NEXT_SCENE === 'plano') {
        log(`Enviando opções de PLANO para ${ctx.chat.id}`)
        const planos = Markup.inlineKeyboard([
            [Markup.callbackButton('START', 'START')],
            [Markup.callbackButton('PREMIUM', 'PREMIUM')],
            [Markup.callbackButton('MASTER', 'MASTER')],
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
