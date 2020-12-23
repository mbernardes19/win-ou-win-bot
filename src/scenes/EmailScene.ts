import { BaseScene, Extra, Markup, Context } from 'telegraf';
import { log } from '../logger';
import { confirmado, negado, validate } from '../services/validate';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

const emailScene = new BaseScene('email');

emailScene.command('reiniciar', ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {}
    return ctx.scene.enter('welcome', ctx.scene.state)
})

emailScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {}
    return await ctx.scene.leave()
})

emailScene.command('', async ctx => {
    log(`Enviando  para ${ctx.chat.id}`)
    const teclado = Markup.inlineKeyboard([
        [Markup.urlButton('👉 SUPORTE', 't.me/winouwin')]
    ]);
    await ctx.reply('Para falar com o , clique abaixo ⤵️', Extra.markup(teclado))
    ctx.scene.session.state = {}
    return await ctx.scene.leave()
})


emailScene.enter(async (ctx) => {
    if (!ctx.scene.session.state['email']) {
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
    await saveEmail(ctx.message.text, ctx);
});

const confirmEmail = async (ctx) => {
    const confirmacao = Markup.inlineKeyboard([Markup.callbackButton('👍 Sim', 'sim'), Markup.callbackButton('👎 Não', 'nao')])
    await ctx.reply(`Confirmando... seu email é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(confirmacao));
    return ctx.scene.enter('confirm_email', ctx.scene.state);
}

const saveEmail = async (email, ctx: SceneContextMessageUpdate) => {
    ctx.scene.session.state = {...ctx.scene.session.state, email}
    log(`Email definido ${email}`);
}

const confirmEmailScene = new BaseScene('confirm_email');

confirmEmailScene.action('sim', async (ctx) => {
    const email = ctx.scene.session.state['email']
    const validation = validate('email', email);
    if (validation.temErro) {
        await ctx.reply(validation.mensagemDeErro);
        return ctx.scene.enter('email', ctx.scene.state);
    }
    await ctx.reply(`Beleza!`);
    return ctx.scene.enter('analysis', ctx.scene.state);
});

confirmEmailScene.action('nao', async (ctx) => {
    await ctx.reply('Por favor, digite seu telefone novamente:')
    return ctx.scene.enter('email', ctx.scene.state);
});

confirmEmailScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const email = ctx.scene.session.state['email']
        const validation = validate('email', email);
        if (validation.temErro) {
            await ctx.reply(validation.mensagemDeErro);
            return ctx.scene.enter('email', ctx.scene.state);
        }
        await ctx.reply(`Beleza!`);
        return ctx.scene.enter('analysis', ctx.scene.state);
    }
    if (negado(ctx)) {
        return ctx.scene.enter('email', ctx.scene.state);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { emailScene, confirmEmailScene };
