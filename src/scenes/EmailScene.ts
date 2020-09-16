import { BaseScene, Extra, Markup, Context } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { confirmado, negado, validate } from '../services/validate';

const emailScene = new BaseScene('email');

emailScene.command('reiniciar', ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    CacheService.clearAllUserData()
    return ctx.scene.enter('welcome')
})

emailScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    CacheService.clearAllUserData()
    return await ctx.scene.leave()
})

emailScene.command('suporte', async ctx => {
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


emailScene.enter(async (ctx) => {
    if (!CacheService.getEmail()) {
        return await askForEmail(ctx);
    }
    await askForEmailAgain(ctx);
});

const askForEmail = async (ctx) => {
    await ctx.reply('Ok!');
    await ctx.reply('Agora eu só preciso que me mande o seu email. Tem que ser o mesmo email com o qual você fez a compra na Monetizze, para que eu possa te achar no sistema.\n\nTenha certeza de estar mandando o email certo!');
}

const askForEmailAgain = async (ctx) => {
    await ctx.reply('Por favor, digite seu email novamente:')
}

emailScene.use(async (ctx) => {
    await confirmEmail(ctx);
    await saveEmail(ctx.message.text);
});

const confirmEmail = async (ctx) => {
    const confirmacao = Markup.inlineKeyboard([Markup.callbackButton('👍 Sim', 'sim'), Markup.callbackButton('👎 Não', 'nao')])
    await ctx.reply(`Confirmando... seu email é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(confirmacao));
    return ctx.scene.enter('confirm_email');
}

const saveEmail = async (email) => {
    CacheService.saveEmail(email);
    log(`Email definido ${email}`);
}

const confirmEmailScene = new BaseScene('confirm_email');

confirmEmailScene.action('sim', async (ctx) => {
    const email = CacheService.getEmail();
    const validation = validate('email', email);
    if (validation.temErro) {
        await ctx.reply(validation.mensagemDeErro);
        return ctx.scene.enter('email');
    }
    await ctx.reply(`Beleza!`);
    return ctx.scene.enter('analysis');
});

confirmEmailScene.action('nao', async (ctx) => {
    await ctx.reply('Por favor, digite seu telefone novamente:')
    return ctx.scene.enter('email');
});

confirmEmailScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const email = CacheService.getEmail();
        const validation = validate('email', email);
        if (validation.temErro) {
            await ctx.reply(validation.mensagemDeErro);
            return ctx.scene.enter('email');
        }
        await ctx.reply(`Beleza!`);
        return ctx.scene.enter('analysis');
    }
    if (negado(ctx)) {
        return ctx.scene.enter('email');
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { emailScene, confirmEmailScene };
