import { BaseScene, Markup, Extra } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { start, premium, master } from '../services/validate';
import { Planos } from '../model/Planos';

const planoScene = new BaseScene('plano')

planoScene.command('reiniciar', ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    CacheService.clearAllUserData()
    return ctx.scene.enter('welcome')
})

planoScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    CacheService.clearAllUserData()
    return await ctx.scene.leave()
})

planoScene.command('suporte', async ctx => {
    log(`Enviando suporte para ${ctx.chat.id}`)
    const teclado = Markup.inlineKeyboard([
        [Markup.urlButton('👉 SUPORTE', 't.me/winouwin')]
    ]);
    await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(teclado))
    CacheService.clearAllUserData()
    return await ctx.scene.leave()
})

planoScene.action(Planos.START, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.START);
    await ctx.scene.enter('name');
})

planoScene.action(Planos.PREMIUM, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.PREMIUM);
    await ctx.scene.enter('name');
})

planoScene.action(Planos.MASTER, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.MASTER);
    await ctx.scene.enter('name');
})

planoScene.use(async (ctx) => {
    if (start(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.START);
        return await ctx.scene.enter('name');
    }
    if (premium(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.PREMIUM);
        return await ctx.scene.enter('name');
    }
    if (master(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.MASTER);
        return await ctx.scene.enter('name');
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

const savePlano = async (plano) => {
    CacheService.savePlano(plano);
    log(`Plano definido ${plano}`);
}

export default planoScene;
