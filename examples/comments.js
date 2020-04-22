/*app.event('member_joined_channel', (body) => {
  //console.log(body)
  body.say(`welcome to <#${body.event.channel}>, <@${body.event.user}>`); // also available: body.context.botToken, body.context.botId, body.context.botUserId
  // everything is available via body
});*/

/*app.event('message', async (body) => {
  if (body.event.channel_type === 'im') {
    app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: body.event.user,
      text: 'hi'
    });
  }
});*/

/*app.message('hello', async ({ message, say }) => {
  await say({
    blocks: [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Hey there <@${message.user}>!`
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Click Me"
        },
        "action_id": "button_click"
      }
    }
    ]
  });
});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  console.log(body)
  console.log(body.message.user)
  try {
    app.client.conversations.create({
      token: process.env.SLACK_BOT_TOKEN,
      name: 'tutorial_island_x',
      is_private: true,
      user_ids: [body.message.user]
    })
  } catch (err) {
    console.log(err)
  }
  //await say(`<@${body.user.id}> clicked the button`);
});*/

/*app.event('member_joined_channel', async body => {
  const dm = await app.client.conversations.open({
    token: process.env.SLACK_BOT_TOKEN,
    users: body.event.user,
    return_im: true
  })
  const lastBotMessage = await getLastBotMessage(dm.channel.id)
  
  if (!lastBotMessage.includes("keys to the community")) {
    app.client.conversations.kick({
      token: process.env.SLACK_OAUTH_TOKEN,
      channel: body.event.channel,
      user: body.event.user
    })
    .catch(err => console.error(err))
  }
});*/