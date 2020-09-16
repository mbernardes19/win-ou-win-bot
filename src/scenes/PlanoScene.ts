import { BaseScene, Markup, Extra } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { silver, gold, diamond, blackDiamond } from '../services/validate';
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
        [Markup.urlButton('👉 SUPORTE 1', 't.me/juliasantanana')],
        [Markup.urlButton('👉 SUPORTE 2', 't.me/diego_sti')],
        [Markup.urlButton('👉 SUPORTE 3', 't.me/julianocba')],
    ]);
    await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(teclado))
    CacheService.clearAllUserData()
    return await ctx.scene.leave()
})

planoScene.action(Planos.SILVER, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.SILVER);
    await ctx.scene.enter('name');
})

planoScene.action(Planos.GOLD, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.GOLD);
    await ctx.scene.enter('name');
})

planoScene.action(Planos.DIAMOND, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.DIAMOND);
    await ctx.scene.enter('name');
})

planoScene.action(Planos.BLACK_DIAMOND, async (ctx) => {
    await ctx.answerCbQuery();
    await savePlano(Planos.BLACK_DIAMOND);
    await ctx.scene.enter('name');
})

planoScene.use(async (ctx) => {
    if (silver(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.SILVER);
        return await ctx.scene.enter('name');
    }
    if (gold(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.GOLD);
        return await ctx.scene.enter('name');
    }
    if (diamond(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.DIAMOND);
        return await ctx.scene.enter('name');
    }
    if (blackDiamond(ctx)) {
        if (!ctx.message) {
            await ctx.answerCbQuery()
        }
        await savePlano(Planos.BLACK_DIAMOND);
        return await ctx.scene.enter('name');
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

const savePlano = async (plano) => {
    CacheService.savePlano(plano);
    log(`Plano definido ${plano}`);
}

export default planoScene;
