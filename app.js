const { App } = require("@slack/bolt");
const AirtablePlus = require("airtable-plus");
const friendlyWords = require("friendly-words");
const GithubSlugger = require("github-slugger");
const slugger = new GithubSlugger();
const axios = require("axios");

const islandTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: "appcstNeqDROujKE7",
  tableName: "Tutorial Island"
});

const eventsTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: "appezi7TOQFt8vTfa",
  tableName: "Events"
});

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

/* Add functionality here */

app.command("/restart", async ({ command, ack, say }) => {
  await ack();
  startTutorial(command.user_id, true);
});

app.event("team_join", async body => {
  await startTutorial(body.event.user.id);
});

app.action("intro_progress", async ({ ack, body }) => {
  ack();

  updateInteractiveMessage(
    body.message.ts,
    body.channel.id,
    `👋 Hi, I'm Clippy! I'm the Hack Club assistant and my job is to get you on the Slack. Do you need assistance?`
  );

  await sendMessage(body.channel.id, "...", 1000);
  await sendMessage(body.channel.id, "...", 1000);
  await sendMessage(
    body.channel.id,
    `I'll take that as a yes! I'm happy to assist you in joining Hack Club today.`,
    1000
  );
  await sendMessage(
    body.channel.id,
    `Just a few quick questions to get you started.`
  );

  await timeout(3000);
  await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: body.channel.id,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Are you currently a high school student? (it's OK if you're not)`
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: "Yes"
            },
            style: "primary",
            action_id: "hs_yes"
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: "No"
            },
            style: "danger",
            action_id: "hs_no"
          }
        ]
      }
    ]
  });
});

app.action("hs_yes", async ({ ack, body }) => {
  ack();
  updateInteractiveMessage(
    body.message.ts,
    body.channel.id,
    "Hack Club is a community of high schoolers, so you'll fit right in!"
  );
  await sendMessage(
    body.channel.id,
    `What brings you to the Hack Club community?`
  );
});

app.action("hs_no", async ({ ack, body }) => {
  ack();
  await updateInteractiveMessage(
    body.message.ts,
    body.channel.id,
    "Just a heads-up: Hack Club is a community of high schoolers, not a community of professional developers. You will likely still find a home here if you are in college, but if you're older than that, you may find yourself lost here."
  );
  await sendSingleBlockMessage(
    body.channel.id,
    "If you understand this and still want to continue on, click the 👍 below.",
    "👍",
    "hs_acknowledge"
  );
});

app.action("hs_acknowledge", async ({ ack, body }) => {
  ack();
  await updateInteractiveMessage(body.message.ts, body.channel.id, "👍");
  await sendMessage(
    body.channel.id,
    `What brings you to the Hack Club community?`
  );
});

app.event("message", async body => {
  if (
    body.message.subtype === "channel_join" &&
    body.message.text === `<@${body.message.user}> has joined the channel`
  ) {
    await app.client.chat.delete({
      token: process.env.SLACK_OAUTH_TOKEN,
      channel: body.message.channel,
      ts: body.message.event_ts
    });
  }

  const correctChannel = await getIslandId(body.event.user);

  if (messageIsPartOfTutorial(body, correctChannel)) {
    const history = await app.client.conversations.history({
      token: process.env.SLACK_BOT_TOKEN,
      channel: body.event.channel
    });
    const botHistory = history.messages.filter(
      message => message.user === process.env.BOT_USER_ID
    );
    const lastBotMessage = botHistory[0].text;
    const lastUserMessage = history.messages[0].text;

    if (lastBotMessage.includes("What brings you")) {
      //console.log(body)
      // send it to welcome-committee
      await sendMessage(
        "C011YTBQ205",
        "New user <@" +
          body.event.user +
          "> joined! Here's why they joined the Hack Club community:\n\n" +
          lastUserMessage +
          "\n\nReact to this message to take ownership on reaching out.",
        10
      );
      await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: body.event.channel,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "Ah, very interesting! Well, let me show you around the community."
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                ":round_pushpin:You're currently on Slack, the platform our community uses. If you're familiar with Discord, you'll find that Slack feels similar. Slack is organized into \"channels\", and each channel includes discussion about its own topic.\n \n We have hundreds of channels, covering everything from game development and web design to photography and cooking. I'll show you a few of my favorites in a minute."
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "*#welcome* \n\nI just invited you to your first channel, #welcome. Join by clicking on it in your sidebar, and introduce yourself to the community."
            },
            accessory: {
              type: "image",
              image_url:
                "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/waving-hand-sign_1f44b.png",
              alt_text: "Waving Hand"
            }
          },
          {
            type: "divider"
          }
        ]
      });

      // add user to #welcome
      await inviteUserToChannel(body.event.user, "C0122U8G28M");
      const island = await getIslandName(body.event.user);
      await sendEphemeralMessage(
        "C0122U8G28M",
        `<@${body.event.user}> Feel free to introduce yourself to the community in <#C75M7C0SY>. When you're done, head back to <https://hackclub.slack.com/archives/${island}|#${island}> to continue your introduction to the community.`,
        body.event.user
      );

      await sendSingleBlockMessage(
        body.event.channel,
        "When you're ready, click the 👍 on this message to continue the tutorial.",
        "👍",
        "introduced"
      );
    }
  }
});

app.action("introduced", async ({ ack, body }) => {
  ack();
  updateInteractiveMessage(
    body.message.ts,
    body.channel.id,
    "Awesome! Let's keep going."
  );

  const nextEvent = await getNextEvent();
  await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: body.channel.id,
    blocks: [
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "There are awesome things happening in the Hack Club community every day! Check out #announcements to see the latest community event. We do everything from coding challenges to AMAs with famous people (e.g. Tom Preston-Werner) to fun hangouts, and more!"
        },
        //"text": {
        //"type": "mrkdwn",
        //"text": "The next community event is called *${nextEvent.name}*, and it's happening on ${nextEvent.day} at ${nextEvent.time} eastern time. You can <${nextEvent.url}|learn more about the event by clicking here>. We'd love to see you there!"
        //},

        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/spiral-calendar-pad_1f5d3.png",
          alt_text: "Calendar"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*#hack-night* \n\nOur favorite recurring community event is called #hack-night. Hack Night is a biweekly call where we all get together and hang out, build things, and have fun! Hack Night happens on Saturdays at 8:30pm eastern and Wednesdays at 3:30pm eastern. We'd love to see you at the next one!"
        },
        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/waxing-crescent-moon-symbol_1f312.png",
          alt_text: "Moon"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*GP (AKA Money!)* \n\nWe also have a community-wide currency called gp! Type /market to see what you can buy with it. You can also play games with the community using GP, check out <#CSHEL6LP5>, <#CN9LWFDQF>, and <#CL4DMMCLQ>. Stay tuned for more super exciting uses! I've also sent you some GP ;) You can check your balance at anytime by typing `/balance`."
        },
        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/money-with-wings_1f4b8.png",
          alt_text: "Money"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*Code of Conduct* \n\nPlease make sure to read our <https://hackclub.com/conduct|code of conduct>. All community members are expected to follow the code of conduct."
        },
        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/page-with-curl_1f4c3.png",
          alt_text: "Document"
        }
      },
      {
        type: "divider"
      }
    ]
  });
  await sendSingleBlockMessage(
    body.channel.id,
    `Once you've read the code of conduct, click the 👍 to continue with the tutorial.`,
    "👍",
    `coc_acknowledge`
  );
});
app.action("coc_acknowledge", async ({ ack, body }) => {
  ack();
  await updateInteractiveMessage(
    body.message.ts,
    body.channel.id,
    "I've added you to a few of the most popular channels, but there are many, many more! Let me introduce to you to them!"
  );
  //finishTutorial(body.channel.id, body.user.id)
  await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: body.channel.id,
    blocks: [
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*#welcome* \n\nYou remember this one, right? Say hello others as they join and give them a warm welcome!"
        },
        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/waving-hand-sign_1f44b.png",
          alt_text: "Waving Hand"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*#announcements* \n\nYou've a bit about our wonderful events. Check #announcements frequently are your sure to not miss one!"
        },
        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/public-address-loudspeaker_1f4e2.png",
          alt_text: "Loud Speaker"
        }
      },

      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*#lounge* \n\nLounge is where people go to hang out with the community. There are no expectations here; just have fun and hang out with the community :)"
        },
        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/speech-balloon_1f4ac.png",
          alt_text: "Speech Bubble"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*#code* \n\nThis channel is where people go to ask technical questions about code. If you're stuck on a problem or need some guidance, this is the place to go."
        },
        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/personal-computer_1f4bb.png",
          alt_text: "Laptop"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*#ship* \n\nShip is where people go to ship, or share, projects they've made. All posts in that are not part of a thread must be projects you've made, and must include a link or attachment. Check out the awesome projects people in the community have made!"
        },
        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/ship_1f6a2.png",
          alt_text: "Ship"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*#hq* \n\nHere you can ask the community/staff any questions about Hack Club."
        },
        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/black-question-mark-ornament_2753.png",
          alt_text: "Question Mark"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*Go explore!* \n\nBut that's not all! Here are a bunch of other active channels that you may be interested in: #hackathons #gamedev #music #support #lgbtq #apple #design #android #cats #dogs #packages #photography #jenga #food #cooking #counttoamillion #film"
        },
        accessory: {
          type: "image",
          image_url:
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/world-map_1f5fa.png",
          alt_text: "Map"
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "Your next steps: start talking to the community! Pick a few channels that you like from this message and start talking. We're excited to meet you :partyparrot: \n \n Also, I also highly recommend setting a profile picture. It makes you look a lot more like a real person :)  \n \n I'm going to head out now—if you have any questions about Hack Club or Slack that I didn't answer, please ask in <#C0C78SG9L> or send a Direct Message to <@U4QAK9SRW>."
        }
      }
    ]
  });

  await completeTutorial(body.user.id);

  // add user to default channels
  await inviteUserToChannel(body.user.id, "C0C78SG9L"); //hq
  await inviteUserToChannel(body.user.id, "C0266FRGV"); //lounge
  await inviteUserToChannel(body.user.id, "C0M8PUPU6"); //ship
  await inviteUserToChannel(body.user.id, "C0EA9S0A0"); //code
  await sendSingleBlockMessage(
    body.channel.id,
    `(Btw, if you want to leave + archive this channel, click here)`,
    "Leave channel",
    "leave_channel"
  );
});

app.action("leave_channel", async ({ ack, body }) => {
  ack();
  await updateInteractiveMessage(
    body.message.ts,
    body.channel.id,
    `(Btw, if you want to leave + archive this channel, click here)`
  );
  await sendSingleBlockMessage(
    body.channel.id,
    `Are you sure? You won't be able to come back to this channel.`,
    `Yes, I'm sure`,
    "leave_confirm",
    10
  );
});
app.action("leave_confirm", async ({ ack, body }) => {
  ack();
  await updateInteractiveMessage(
    body.message.ts,
    body.channel.id,
    `Okay! Bye :wave:`
  );

  // invite matthew to the private channel & archive it
  await app.client.conversations.invite({
    token: process.env.SLACK_BOT_TOKEN,
    channel: body.channel.id,
    users: `U4QAK9SRW`
  });
  await app.client.conversations.archive({
    token: process.env.SLACK_OAUTH_TOKEN,
    channel: body.channel.id
  });
});

app.event("member_joined_channel", async body => {
  const completed = await hasCompletedTutorial(body.event.user);
  if (body.event.channel !== "C75M7C0SY" && !completed) {
    const members = await app.client.conversations.members({
      token: process.env.SLACK_BOT_TOKEN,
      channel: body.event.channel
    });
    if (!members.members.includes("U4QAK9SRW")) {
      // user who owns the oauth, in this case @matthew
      await app.client.conversations.join({
        token: process.env.SLACK_OAUTH_TOKEN,
        channel: body.event.channel
      });
    }
    await app.client.conversations.kick({
      token: process.env.SLACK_OAUTH_TOKEN,
      channel: body.event.channel,
      user: body.event.user
    });
    await sendMessage(
      body.event.user,
      `It looks like you tried to join <#${body.event.channel}>. You can't join any channels yet—I need to finish helping you join the community first.`,
      10
    );
  }
});

async function sendMessage(channel, text, delay, ts, unfurl) {
  await timeout(delay || 3000);
  const msg = await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channel,
    text: text,
    thread_ts: null || ts,
    unfurl_links: unfurl ? unfurl : false
  });
  return msg;
}

async function sendEphemeralMessage(channel, text, user) {
  await app.client.chat.postEphemeral({
    token: process.env.SLACK_BOT_TOKEN,
    attachments: [],
    channel: channel,
    text: text,
    user: user
  });
}

async function startTutorial(user, restart) {
  const islandName = await generateIslandName();
  const newChannel = await app.client.conversations.create({
    token: process.env.SLACK_BOT_TOKEN,
    name: islandName.channel,
    is_private: true,
    user_ids: process.env.BOT_USER_ID
  });
  const channelId = newChannel.channel.id;

  await app.client.conversations
    .invite({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      users: user
    })
    .catch(err => console.log(err.data.errors));

  if (restart) {
    let record = await getUserRecord(user);
    if (typeof record === "undefined") {
      record = await islandTable.create({
        Name: user,
        "Island Channel ID": channelId,
        "Island Channel Name": islandName.channel,
        "Has completed tutorial": false
      });
    }
    await islandTable.update(record.id, {
      "Island Channel ID": channelId,
      "Island Channel Name": islandName.channel,
      "Has completed tutorial": true
    });
  } else {
    await islandTable.create({
      Name: user,
      "Island Channel ID": channelId,
      "Island Channel Name": islandName.channel,
      "Has completed tutorial": false
    });
  }

  await sendSingleBlockMessage(
    channelId,
    `Hi, I'm Clippy! I'm the Hack Club assistant and my job is to get you on the Slack. Do you need assistance?`,
    `What the heck? Who are you?`,
    `intro_progress`,
    10
  );
}

async function sendSingleBlockMessage(
  channel,
  text,
  blockText,
  actionId,
  delay
) {
  await timeout(delay || 3000);
  await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channel,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: text
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: blockText,
              emoji: true
            },
            action_id: actionId
          }
        ]
      }
    ]
  });
}

async function updateInteractiveMessage(ts, channel, message) {
  const result = await app.client.chat.update({
    token: process.env.SLACK_BOT_TOKEN,
    // ts of message to update
    ts: ts,
    // Channel of message
    channel: channel,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: message
        }
      }
    ],
    text: "Message from Test App"
  });
}

async function inviteUserToChannel(user, channel) {
  await app.client.conversations
    .invite({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel,
      users: user
    })
    .catch(err => {
      if (err.data.error === "already_in_channel") {
        console.log(`${user} is already in ${channel}—skipping this step...`);
      }
    });
}

async function getIslandId(userId) {
  let record = await getUserRecord(userId);
  if (typeof record === "undefined") return null;
  return record.fields["Island Channel ID"];
}
async function getIslandName(userId) {
  let record = await getUserRecord(userId);
  return record.fields["Island Channel Name"];
}

async function getNextEvent() {
  let record = (await eventsTable.read({
    view: "Future Events",
    maxRecords: 1
  }))[0];
  const eventUrl = `https://events.hackclub.com/${slugger.slug(
    record.fields["Title"]
  )}`;

  return {
    name: record.fields["Title"],
    day: record.fields["Date (formatted)"],
    time: record.fields["Time (formatted)"],
    url: eventUrl
  };
}

async function sendGP(user, channel, amount) {
  const completed = await hasCompletedTutorial(user);
  if (completed) {
    console.log(
      `${user} has completed this tutorial before, so I won't give them the gp.`
    );
    await sendMessage(
      channel,
      `(Looks like you completed this tutorial before, so I won't give you the gp this time)`,
      1000
    );
  } else {
    axios
      .post("https://bankerapi.glitch.me/give", {
        token: process.env.BANKER_TOKEN,
        send_id: user,
        give_id: process.env.BOT_USER_ID,
        gp: amount,
        reason: "Starting you off!"
      })
      .then(response => console.log(response));
  }
}

async function generateIslandName() {
  const words = friendlyWords.predicates;
  const word1 = words[Math.floor(Math.random() * 1455)];
  const word2 = words[Math.floor(Math.random() * 1455)];
  const channel = `${word1}-${word2}-island`;
  const pretty = `${capitalizeFirstLetter(word1)} ${capitalizeFirstLetter(
    word2
  )} Tutorial Island`;

  const taken = await checkIslandNameTaken(channel);
  if (taken) return generateIslandName();

  return {
    channel: channel,
    pretty: pretty
  };
}

async function completeTutorial(userId) {
  let record = await getUserRecord(userId);
  await islandTable.update(record.id, { "Has completed tutorial": true });
}

async function hasCompletedTutorial(userId) {
  let record = await getUserRecord(userId);
  if (typeof record === "undefined") return true;
  return record.fields["Has completed tutorial"];
}

async function getUserRecord(userId) {
  try {
    let record = (await islandTable.read({
      filterByFormula: `{Name} = '${userId}'`,
      maxRecords: 1
    }))[0];
    return record;
  } catch {}
}

async function checkIslandNameTaken(islandName) {
  let record = (await islandTable.read({
    filterByFormula: `{Island Channel Name} = '${islandName}'`,
    maxRecords: 1
  }))[0];
  return record !== undefined;
}

function messageIsPartOfTutorial(body, correctChannel) {
  return (
    body.event.channel_type === "group" &&
    body.event.subtype !== "group_join" &&
    body.event.subtype !== "channel_join" &&
    body.event.user !== "U012CUN4U1X" &&
    body.event.channel === correctChannel
  );
}

function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
