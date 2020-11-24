import { BaseScene, Markup, Extra } from 'telegraf';
import { log } from '../logger';
import { start, premium, master } from '../services/validate';
import { Planos } from '../model/Planos';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

const planoScene = new BaseScene('plano')

planoScene.command('reiniciar', ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {}
    return ctx.scene.enter('welcome', ctx.scene.state)
})

planoScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {}
    return await ctx.scene.leave()
})

planoScene.command('suporte', async ctx => {
    log(`Enviando suporte para ${ctx.chat.id}`)
    const teclado = Markup.inlineKeyboard([
        [Markup.urlButton('👉 SUPORTE', 't.me/winouwin')]
    ]);
    await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(teclado))
    ctx.scene.session.state = {}
    return await ctx.scene.leave()
})

planoScene.action(Planos.START, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.START, ctx);
    await ctx.scene.enter('name', ctx.scene.state);
})

planoScene.action(Planos.PREMIUM, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.PREMIUM, ctx);
    await ctx.scene.enter('name', ctx.scene.state);
})

planoScene.action(Planos.VIP, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.VIP, ctx);
    await ctx.scene.enter('name', ctx.scene.state);
})

planoScene.use(async (ctx) => {
    if (start(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.START, ctx);
        return await ctx.scene.enter('name', ctx.scene.state);
    }
    if (premium(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.PREMIUM, ctx);
        return await ctx.scene.enter('name', ctx.scene.state);
    }
    if (master(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.VIP, ctx);
        return await ctx.scene.enter('name', ctx.scene.state);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

const savePlano = async (plano, ctx: SceneContextMessageUpdate) => {
    ctx.scene.session.state = {...ctx.scene.session.state, plano}
    log(`Plano definido ${plano}`);
}

export default planoScene;
