import { BaseScene, Extra, Markup } from 'telegraf';
import { log } from '../logger';
import { confirmado, negado } from '../services/validate';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';

const nameScene = new BaseScene('name');

nameScene.command('reiniciar', ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {}
    return ctx.scene.enter('welcome', ctx.scene.state)
})

nameScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    ctx.scene.session.state = {}
    return await ctx.scene.leave()
})

nameScene.command('suporte', async ctx => {
    log(`Enviando suporte para ${ctx.chat.id}`)
    const teclado = Markup.inlineKeyboard([
        [Markup.urlButton('👉 SUPORTE', 't.me/winouwin')]
    ]);
    await ctx.reply('Para falar com o suporte, clique abaixo ⤵️', Extra.markup(teclado))
    ctx.scene.session.state = {}
    return await ctx.scene.leave()
})

nameScene.enter(async (ctx) => {
    if (!ctx.scene.session.state['fullName']) {
        return await askForFullName(ctx);
    }
    await askForFullNameAgain(ctx);
})

nameScene.use(async (ctx) => {
    await confirmFullName(ctx);
    await saveFullName(ctx.message.text, ctx);
});

const askForFullName = async (ctx) => {
    await ctx.reply('Ok!');
    await ctx.reply('Qual é o seu nome completo?');
}

const askForFullNameAgain = async (ctx) => {
    await ctx.reply('Por favor, digite seu nome completo novamente:')
}

const confirmFullName = async (ctx) => {
    const confirmacao = Markup.inlineKeyboard([Markup.callbackButton('👍 Sim', 'sim'), Markup.callbackButton('👎 Não', 'nao')])
    await ctx.reply(`Confirmando... seu nome completo é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(confirmacao));
    return ctx.scene.enter('confirm_name', ctx.scene.state);
}

const saveFullName = async (fullName, ctx: SceneContextMessageUpdate) => {
    log('salvou o nome')
    ctx.scene.session.state = {...ctx.scene.session.state, fullName}
    log(`Nome completo definido ${fullName}`);
}

const confirmNameScene = new BaseScene('confirm_name');

confirmNameScene.action('sim', async (ctx) => {
    const nome = ctx.scene.session.state['fullName'];
    await ctx.reply(`Beleza, ${nome.includes(' ') ? nome.substring(0, nome.indexOf(' ')) : nome}!`);
    return ctx.scene.enter('phone', ctx.scene.state);
});

confirmNameScene.action('nao', async (ctx) => {
    return ctx.scene.enter('name', ctx.scene.state);
});

confirmNameScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const nome = ctx.scene.session.state['fullName'];
        await ctx.reply(`Beleza, ${nome.includes(' ') ? nome.substring(0, nome.indexOf(' ')) : nome}!`);
        return ctx.scene.enter('phone', ctx.scene.state);
    }
    if (negado(ctx)) {
        return ctx.scene.enter('name', ctx.scene.state);
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { nameScene, confirmNameScene };
