const axios = require("axios");

const {
  sendEphemeralMessage,
  getUserRecord,
  getIslandId,
  sendMessage,
  setPronouns,
  getPronouns,
  updateSingleBlockMessage,
  sendSingleBlockMessage,
  updateInteractiveMessage,
  messageIsPartOfTutorial,
  inviteUserToChannel,
  getIslandName,
  completeTutorial,
  timeout,
  updatePushedButton,
  setPreviouslyCompletedTutorial,
  hasPreviouslyCompletedTutorial,
  islandTable,
  getLatestMessages,
  sendToWelcomeCommittee,
  promoteUser,
  sendCustomizedMessage,
  setHS,
  setRegion,
} = require("../utils/utils");

async function defaultFilter(e) {
  try {
    const userID =
      e.body.user_id || (e.body.event ? e.body.event.user : e.body.user.id);
    const flowOptions = {
      maxRecords: 1,
      filterByFormula: `AND(Name = '${userID}', Flow = 'Default')`,
    };
    let data = await axios(
      "https://api2.hackclub.com/v0.1/Tutorial%20Island/Tutorial%20Island?select=" +
        JSON.stringify(flowOptions)
    ).then((r) => r.data);
    return data[0] != null;
  } catch {
    return true;
  }
}

async function runInFlow(opts, func) {
  if (await defaultFilter(opts)) {
    return await func(opts);
  }
}

const loadFlow = (app) => {
  async function introProgress(body) {
    updateInteractiveMessage(
      app,
      body.message.ts,
      body.channel.id,
      `Hi there, I'm Clippy! It looks like you want join the Hack Club community. Before you unlock it, I need to show you around for a minute! Could you please click that button :point_down: so we can get this show on the road?`
    );
    updatePushedButton(body.user.id);
    await sendMessage(
      app,
      body.channel.id,
      `Excellent! I'm happy to assist you in joining Hack Club today.`,
      1000
    );
    const prevCompleted = await hasPreviouslyCompletedTutorial(body.user.id);
    if (prevCompleted) {
      await sendMessage(app, body.channel.id, `A few quick questions:`);
    } else {
      await setPreviouslyCompletedTutorial(body.user.id);
      await sendMessage(
        app,
        body.channel.id,
        `Now that that's out of the way, a few quick questions:`,
        2000
      );
    }
    await timeout(2000);
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: body.channel.id,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `What are your pronouns? (how you want to be referred to by others)`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "she/her/hers",
              },
              style: "primary",
              action_id: "she",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "he/him/his",
              },
              style: "primary",
              action_id: "he",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "they/them/theirs",
              },
              style: "primary",
              action_id: "they",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "something else",
              },
              style: "primary",
              action_id: "something_else",
            },
          ],
        },
      ],
    });
  }

  app.action("intro_progress_1", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      introProgress(body);
    })
  );

  app.action("intro_progress_2", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      introProgress(body);
    })
  );

  app.action("intro_progress_3", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      introProgress(body);
    })
  );

  app.action("intro_progress", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      introProgress(body);
    })
  );

  app.action("she", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await setPronouns(app, body.user.id, "she/her/hers", "she");
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `What are your pronouns? (how you want to be referred to by others)`,
        `she/her/hers`,
        `previously_pressed`
      );
      await sendMessage(
        app,
        body.channel.id,
        `:heart: Every profile here has a custom field for pronouns—I've gone ahead and set your pronouns for you, but <${`https://slack.com/intl/en-sg/help/articles/204092246-Edit-your-profile`}|here's a quick tutorial if you'd like to change them.>`
      );
      sendRegionQuestion(body.channel.id);
    })
  );

  app.action("he", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await setPronouns(app, body.user.id, "he/him/his", "he");
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `What are your pronouns? (how you want to be referred to by others)`,
        `he/him/his`,
        `previously_pressed`
      );
      await sendMessage(
        app,
        body.channel.id,
        `:heart: Every profile here has a custom field for pronouns—I've gone ahead and set your pronouns for you, but <${`https://slack.com/intl/en-sg/help/articles/204092246-Edit-your-profile`}|here's a quick tutorial if you'd like to change them.>`
      );
      sendRegionQuestion(body.channel.id);
    })
  );

  app.action("they", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await setPronouns(app, body.user.id, "they/them/theirs", "they");
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `What are your pronouns? (how you want to be referred to by others)`,
        `they/them/theirs`,
        `previously_pressed`
      );
      await sendMessage(
        app,
        body.channel.id,
        `:heart: Every profile here has a custom field for pronouns—I've gone ahead and set your pronouns for you, but <${`https://slack.com/intl/en-sg/help/articles/204092246-Edit-your-profile`}|here's a quick tutorial if you'd like to change them.>`
      );
      sendRegionQuestion(body.channel.id);
    })
  );

  app.action("something_else", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `What are your pronouns? (how you want to be referred to by others)`,
        `something else`,
        `previously_pressed`
      );
      await sendMessage(
        app,
        body.channel.id,
        `What are your preferred pronouns? (Type your answer in chat)`
      );
    })
  );

  app.action("asia", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await setRegion(app, body.user.id, "APAC");
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `Which continent do you currently live in?`,
        `Asia`,
        `previously_pressed`
      );
      sendHsQuestion(body.channel.id);
    })
  );

  app.action("africa", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await setRegion(app, body.user.id, "APAC");
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `Which continent do you currently live in?`,
        `Africa`,
        `previously_pressed`
      );
      sendHsQuestion(body.channel.id);
    })
  );

  app.action("americas", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await setRegion(app, body.user.id, "Non-APAC");
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `Which continent do you currently live in?`,
        `The Americas`,
        `previously_pressed`
      );
      sendHsQuestion(body.channel.id);
    })
  );

  app.action("europe", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await setRegion(app, body.user.id, "Non-APAC");
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `Which continent do you currently live in?`,
        `Europe`,
        `previously_pressed`
      );
      sendHsQuestion(body.channel.id);
    })
  );

  app.action("oceania", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await setRegion(app, body.user.id, "Non-APAC");
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `Which continent do you currently live in?`,
        `Oceania`,
        `previously_pressed`
      );
      sendHsQuestion(body.channel.id);
    })
  );

  app.action("hs_yes", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await setHS(app, body.user.id, true);
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `Are you currently a high school student? (it's OK if you're not)`,
        `Yep!`,
        `previously_pressed`
      );
      await sendMessage(
        app,
        body.channel.id,
        "Great. Hack Club is a community of high schoolers, so you'll fit right in!",
        1000
      );
      await sendMessage(
        app,
        body.channel.id,
        `What brings you to the Hack Club community? (Type your answer in the chat)`,
        500
      );
    })
  );

  app.action("hs_no", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      let hsCallResponse = await setHS(app, body.user.id, false);
      updateSingleBlockMessage(
        app,
        body.message.ts,
        body.channel.id,
        `Are you currently a high school student? (it's OK if you're not)`,
        `No`,
        `previously_pressed`
      );
      if (hsCallResponse.fields["Regional Flow"] == "APAC") {
        await sendMessage(
          app,
          body.channel.id,
          "Just a heads-up: Hack Club is a community of students, not a community of professional developers."
        );
      } else {
        await sendMessage(
          app,
          body.channel.id,
          "Just a heads-up: Hack Club is a community of high schoolers, not a community of professional developers. You will likely still find a home here if you are in college, but if you're older than that, you may find yourself lost here."
        );
      }
      await sendSingleBlockMessage(
        app,
        body.channel.id,
        "If you understand this and still want to continue on, click the 👍 below.",
        "👍",
        "hs_acknowledge"
      );
    })
  );

  app.action("hs_acknowledge", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await updateInteractiveMessage(
        app,
        body.message.ts,
        body.channel.id,
        "👍"
      );
      await sendMessage(
        app,
        body.channel.id,
        `What brings you to the Hack Club community? (Type your answer in the chat)`
      );
    })
  );

  app.event("message", async (body) => {
    const correctChannel = await getIslandId(body.event.user);
    if (messageIsPartOfTutorial(body, correctChannel)) {
      if (await defaultFilter({ body: body })) {
        const latestMessages = await getLatestMessages(app, body.event.channel);
        const lastBotMessage = latestMessages.lastBotMessage;
        const lastUserMessage = latestMessages.lastUserMessage;
        if (lastBotMessage.includes("What are your preferred pronouns")) {
          let pronouns = lastUserMessage;
          let pronoun1 = lastUserMessage.slice(0, lastUserMessage.search("/"));
          await setPronouns(
            app,
            body.event.user,
            pronouns,
            pronoun1.toLowerCase()
          );
          await sendMessage(
            app,
            body.event.channel,
            `:heart: Every profile here has a custom field for pronouns—I've gone ahead and set your pronouns for you, but <${`https://slack.com/intl/en-sg/help/articles/204092246-Edit-your-profile`}|here's a quick tutorial if you'd like to change them.>`
          );
          await sendRegionQuestion(body.event.channel);
        }
        if (lastBotMessage.includes("What brings you")) {
          const userRecord = await getUserRecord(body.event.user);
          islandTable.update(userRecord.id, {
            "What brings them?": body.event.text,
          });
          await sendMessage(
            app,
            body.event.channel,
            `Neatoio! Well, it looks like the next step on my script is to show you around the community :hackclub::slack:`
          );
          await sendMessage(
            app,
            body.event.channel,
            `You're currently on Slack, the platform our community uses. It's kind of like Discord, but a little different.`
          );
          await sendMessage(
            app,
            body.event.channel,
            `Slack is organized into topical "channels". We have _hundreds_ of channels in our Slack, covering everything from—`,
            5000
          );
          await timeout(1000);
          if (userRecord["fields"]["Assigned Flow"] == "APAC-FULL") {
            await inviteUserToChannel(
              app,
              body.event.user,
              "C031ARY1F27",
              true
            );
            await sendEphemeralMessage(
              app,
              "C031ARY1F27",
              `<@${body.event.user}> Welcome to <#C031ARY1F27>, the hangout spot for Hack Clubbers! Feel free to chat, hang out, ask questions, whatever :orpheus:`,
              body.event.user
            );
          } else {
            await inviteUserToChannel(app, body.event.user, "C0266FRGV", true);
            await sendEphemeralMessage(
              app,
              "C0266FRGV",
              `<@${body.event.user}> Welcome to <#C0266FRGV>, the hangout spot for Hack Clubbers! Feel free to chat, hang out, ask questions, whatever :orpheus:`,
              body.event.user
            );
          }
          await sendMessage(
            app,
            body.event.channel,
            "Wait a second...did you hear that??",
            2000
          );
          await sendMessage(
            app,
            body.event.channel,
            `...it sounds like a Slack ping!`,
            2000
          );
          if (userRecord["fields"]["Assigned Flow"] == "APAC-FULL") {
            await sendMessage(
              app,
              body.event.channel,
              `Oh!!! It looks like you're already in a channel! <#C031ARY1F27>, the hangout channel for Hack Club members.`
            );
          } else {
            await sendMessage(
              app,
              body.event.channel,
              `Oh!!! It looks like you're already in a channel! <#C0266FRGV>, the hangout channel for Hack Club members.`
            );
          }
          await sendMessage(
            app,
            body.event.channel,
            `Try clicking the red :ping: on your sidebar to the left :eyes:`
          );
          await sendMessage(
            app,
            body.event.channel,
            `<@${body.event.user}> As I was saying before I got distracted, we have _hundreds_ of these "channels" in the community, covering every topic you can think of, from \`#gamedev\` and \`#code\` to \`#photography\` and \`#cooking\`. We have nearly 1,000 weekly active members on here—wowee, that's a lot!!!`,
            10000
          );
          await sendMessage(
            app,
            body.event.channel,
            `Want to be invited to another channel?`,
            3000
          );
          const welcomeChannel = "C75M7C0SY";
          const welcomeChannelAPAC = "C031ARE1DU2";
          await timeout(3000);
          if (userRecord["fields"]["Assigned Flow"] == "APAC-FULL") {
            await inviteUserToChannel(
              app,
              body.event.user,
              welcomeChannelAPAC,
              true
            );
            const island = await getIslandName(body.event.user);
            await sendEphemeralMessage(
              app,
              welcomeChannelAPAC,
              `<@${body.event.user}> Feel free to introduce yourself to the community in <#${welcomeChannelAPAC}>. When you're done, head back to <https://hackclub.slack.com/archives/${island}|#${island}> to continue your introduction to the community.`,
              body.event.user
            );
            await sendCustomizedMessage(
              app,
              body.event.channel,
              `I just invited you to your second channel, <#${welcomeChannelAPAC}>. Join by clicking on it in your sidebar, and feel free to introduce yourself to the community. (totally optional, no expectations)`,
              "https://cloud-hz5majdx9.vercel.app/moshed-2020-9-8-13-50-21.jpg",
              null,
              1000
            );
            await sendSingleBlockMessage(
              app,
              body.event.channel,
              "When you're ready, click the 👍 on this message to continue.",
              "👍",
              "introduced"
            );
          } else {
            await inviteUserToChannel(
              app,
              body.event.user,
              welcomeChannel,
              true
            );
            const island = await getIslandName(body.event.user);
            await sendEphemeralMessage(
              app,
              welcomeChannel,
              `<@${body.event.user}> Feel free to introduce yourself to the community in <#${welcomeChannel}>. When you're done, head back to <https://hackclub.slack.com/archives/${island}|#${island}> to continue your introduction to the community.`,
              body.event.user
            );
            await sendCustomizedMessage(
              app,
              body.event.channel,
              `I just invited you to your second channel, <#${welcomeChannel}>. Join by clicking on it in your sidebar, and feel free to introduce yourself to the community. (totally optional, no expectations)`,
              "https://cloud-hz5majdx9.vercel.app/moshed-2020-9-8-13-50-21.jpg",
              null,
              1000
            );
            await sendSingleBlockMessage(
              app,
              body.event.channel,
              "When you're ready, click the 👍 on this message to continue.",
              "👍",
              "introduced"
            );
          }
        }
      }
    }
  });

  app.action("introduced", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      updateInteractiveMessage(app, body.message.ts, body.channel.id, "👍");
      await sendMessage(app, body.channel.id, `Cool beans!!! :beany:`);
      await sendMessage(
        app,
        body.channel.id,
        `Before you proceed, please make sure to read and abide by our <https://hackclub.com/conduct|code of conduct>. Every community member is expected to follow the code of conduct anywhere in the community.`,
        3000,
        null,
        true
      );
      await sendSingleBlockMessage(
        app,
        body.channel.id,
        `Once you've read the code of conduct, click the :thumbsup: to unlock the Hack Club community.`,
        "👍",
        "coc_acknowledge"
      );
    })
  );

  app.action("coc_acknowledge", (e) =>
    runInFlow(e, async ({ ack, body }) => {
      ack();
      await promoteUser(body.user.id);
      await updateInteractiveMessage(
        app,
        body.message.ts,
        body.channel.id,
        "👍"
      );
      const userRecord = await getUserRecord(body.user.id);
      const reasonJoined = userRecord.fields["What brings them?"];
      sendToWelcomeCommittee(app, body.user.id, reasonJoined);
      await sendMessage(
        app,
        body.channel.id,
        `Woohoo! Welcome to Hack Club! :yay::orpheus::snootslide:`,
        1000
      );
      if (userRecord["fields"]["Assigned Flow"] != "APAC-FULL") {
        const finalMessage = await sendMessage(
          app,
          body.channel.id,
          `I've added you to a few of the most popular channels, but there are many, many more! Click on "2 replies" just under this message to discover some other cool channels...`,
          5000
        );
        const finalTs = finalMessage.message.ts;
        const hqDesc = `*<#C0C78SG9L>* is where people ask the community/@staff any questions about Hack Club.`;
        const shipDesc = `*<#C0M8PUPU6>* is where people go to _ship_, or share, projects they've made. All posts in that are not part of a thread must be projects you've made, and must include a link or attachment. Check out the awesome projects people in the community have made!`;
        const codeDesc = `*<#C0EA9S0A0>* is where people go to ask technical questions about code. If you're stuck on a problem or need some guidance, this is the place to go. `;
        const communityDesc = `*<#C01D7AHKMPF>* is where you'll find community-related announcements! :mega:`;
        // channel descriptions
        await sendMessage(
          app,
          body.channel.id,
          `Here are a bunch of other active channels that you may be interested in:`,
          10,
          finalTs
        );
        await sendMessage(
          app,
          body.channel.id,
          `<#C013AGZKYCS> – Get to know the community by answering a question every day!
        <#C0NP503L7> - Upcoming events
        <#C6LHL48G2> - Game Development
        <#C0DCUUH7E> - Share your favorite music!
        <#CA3UH038Q> - Talk to others in the community!
        <#C90686D0T> - Talk about the LGBTQ community!
        <#CCW6Q86UF> - :appleinc:
        <#C1C3K2RQV> - Learn about design!
        <#CCW8U2LBC> - :google:
        <#CDLBHGUQN> - Photos of cats!
        <#CDJV1CXC2> - Photos of dogs!
        <#C14D3AQTT> - A public log of Hack Club's sent packages!
        <#CBX54ACPJ> - Share your photos!
        <#CC78UKWAC> - :jenga_sleep:
        <#C8P6DHA3W> - Don't enter if you're hungry!
        <#C010SJJH1PT> - Learn about cooking!
        <#CDJMS683D> - Count to a million, one at a time.
        <#CDN99BE9L> - Talk about Movies & TV!`,
          10,
          finalTs
        );
        let pronouns = await getPronouns(body.user.id);
        if (
          pronouns.pronouns === "they/them/theirs" ||
          pronouns.pronouns === "she/her/hers"
        ) {
          await sendMessage(
            app,
            body.channel.id,
            `Also, check out <#CFZMXJ3FB>—it’s a channel for women/femme/non-binary people in Hack Club!`,
            1000
          );
        }
        await completeTutorial(body.user.id);
        // add user to default channels
        await inviteUserToChannel(app, body.user.id, "C0C78SG9L"); //hq
        await inviteUserToChannel(app, body.user.id, "C0M8PUPU6"); //ship
        await inviteUserToChannel(app, body.user.id, "C0EA9S0A0"); //code
        await inviteUserToChannel(app, body.user.id, "C01504DCLVD"); //scrapbook
        await inviteUserToChannel(app, body.user.id, "C01D7AHKMPF"); //community
        if (userRecord["fields"]["Assigned Flow"] == "APAC-MIX") {
          // for high schoolers in APAC
          await inviteUserToChannel(app, body.user.id, "C031AQUNKQS"); //apac-community
        }
        await sendEphemeralMessage(app, "C0C78SG9L", hqDesc, body.user.id);
        await sendEphemeralMessage(app, "C0M8PUPU6", shipDesc, body.user.id);
        await sendEphemeralMessage(app, "C0EA9S0A0", codeDesc, body.user.id);
        await sendEphemeralMessage(
          app,
          "C01D7AHKMPF",
          communityDesc,
          body.user.id
        );
      } else {
        const hqDesc = `*<#C031456DCHL>* is where people ask the community/@staff any questions about Hack Club.`;
        const communityDesc = `*<#C031AQUNKQS>* is where you'll find community-related announcements! :mega:`;
        const promotionsDesc = `*<#C0320HLTFDE>* is where you can promote events! :mega:`;
        const rankersDesc = `*<#C02BTU651FD>* is where you can rank! :mega:`;
        await inviteUserToChannel(app, body.user.id, "C031456DCHL"); // apac-hq
        await inviteUserToChannel(app, body.user.id, "C031AQUNKQS"); // apac-community
        await inviteUserToChannel(app, body.user.id, "C0320HLTFDE"); // apac-promotions
        await inviteUserToChannel(app, body.user.id, "C02BTU651FD"); // rankers-office
        await sendEphemeralMessage(app, "C031456DCHL", hqDesc, body.user.id);
        await sendEphemeralMessage(
          app,
          "C0320HLTFDE",
          promotionsDesc,
          body.user.id
        );
        await sendEphemeralMessage(
          app,
          "C02BTU651FD",
          rankersDesc,
          body.user.id
        );
        await sendEphemeralMessage(
          app,
          "C031AQUNKQS",
          communityDesc,
          body.user.id
        );
        await sendMessage(
          app,
          body.channel.id,
          `Your next steps: start talking to the community! We're excited to meet you :partyparrot:`
        );
        await sendMessage(
          app,
          body.channel.id,
          `I also highly recommend setting a profile picture. It makes you look a lot more like a real person :)`
        );
        await sendMessage(
          app,
          body.channel.id,
          `I'm going to head out now — if you have any questions about Hack Club or Slack that I didn't answer, please ask in <#C031456DCHL>.`
        );
        await sendCustomizedMessage(
          app,
          body.channel.id,
          `Toodles! :wave:`,
          "https://cloud-hz5majdx9.vercel.app/moshed-2020-9-8-13-50-11.jpg"
        );
        await timeout(2000);
        await sendSingleBlockMessage(
          app,
          body.channel.id,
          `(Btw, if you want to leave + archive this channel, click here)`,
          "Leave channel",
          "leave_channel"
        );
      }
      let userProfile = await app.client.users.info({
        token: process.env.SLACK_BOT_TOKEN,
        user: body.user.id,
      });
      const airtableQueryOptions = {
        maxRecords: 1,
        filterByFormula: `{Email Address} = '${userProfile.user.profile.email}'`,
      };
      // the following adds users to their club channel if they registered with one
      let joinData = await axios(
        `https://api2.hackclub.com/v0.1/Joins/Join%20Requests?authKey=${
          process.env.AIRTABLE_API_KEY
        }&select=${JSON.stringify(airtableQueryOptions)}&meta=true`
      ).then((r) => r.data);
      if (joinData["response"].length > 0) {
        if (joinData["response"][0]["fields"]["Club"]) {
          await app.client.conversations.join({
            token: process.env.SLACK_BOT_TOKEN,
            channel: joinData["response"][0]["fields"]["Club"],
          });
          await inviteUserToChannel(
            app,
            body.user.id,
            joinData["response"][0]["fields"]["Club"]
          );
          await sendMessage(
            app,
            body.channel.id,
            `:eyes: I see you are a member of the <#${joinData["response"][0]["fields"]["Club"]}> club! I've added you to the club's channel so you can chat with your fellow club members!`
          );
          await timeout(3000);
        }
      }
      await sendMessage(
        app,
        body.channel.id,
        `Your next steps: start talking to the community! We're excited to meet you :partyparrot:`
      );
      await sendCustomizedMessage(
        app,
        body.channel.id,
        `To find channels where people are talking about stuff you're interested in, click on the \`+\` next to "Channels" in the sidebar and search for your favorite coding languages, types of projects, pets... there are over 1000 channels, so I'm sure you'll find something! https://cloud-7njybwq01-hack-club-bot.vercel.app/0channels__1_.gif`
      );
      await sendMessage(
        app,
        body.channel.id,
        `I also highly recommend setting a profile picture. It makes you look a lot more like a real person :)`
      );
      await sendMessage(
        app,
        body.channel.id,
        `I'm going to head out now — if you have any questions about Hack Club or Slack that I didn't answer, please ask in <#C0C78SG9L> or send a Direct Message to <@U01DV5F30CF>.`
      );
      await sendCustomizedMessage(
        app,
        body.channel.id,
        `Toodles! :wave:`,
        "https://cloud-hz5majdx9.vercel.app/moshed-2020-9-8-13-50-11.jpg"
      );
      await timeout(3000);
      await sendSingleBlockMessage(
        app,
        body.channel.id,
        `(Btw, if you want to leave + archive this channel, click here)`,
        "Leave channel",
        "leave_channel"
      );
    })
  );

  async function sendHsQuestion(channel) {
    await timeout(1000);
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Are you currently a high school student? (it's OK if you're not)`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Yep!",
              },
              style: "primary",
              action_id: "hs_yes",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "No",
              },
              style: "danger",
              action_id: "hs_no",
            },
          ],
        },
      ],
    });
  }

  async function sendRegionQuestion(channel) {
    await timeout(1000);
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Which continent do you currently live in?`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "The Americas",
              },
              style: "primary",
              action_id: "americas",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Europe",
              },
              style: "primary",
              action_id: "europe",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Africa",
              },
              style: "primary",
              action_id: "africa",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Asia",
              },
              style: "primary",
              action_id: "asia",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Oceania",
              },
              style: "primary",
              action_id: "oceania",
            },
          ],
        },
      ],
    });
  }
};

exports.loadFlow = loadFlow;