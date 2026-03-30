const { Client, GatewayIntentBits, Events, ActivityType } = require("discord.js");
const { Shoukaku, Connectors } = require("shoukaku");
const dns = require('node:dns');
const net = require('node:net');
const configs = require("./config");

dns.setDefaultResultOrder('ipv4first');
if (net.setDefaultAutoSelectFamilyAttemptTimeout) {
  net.setDefaultAutoSelectFamilyAttemptTimeout(5000);
}

function startBot(config) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), config.lavalink);
  let player = null;
  let isStarting = false;

  shoukaku.on("error", (name, error) => console.error(`[${config.name}] Node "${name}" error:`, error.message));
  shoukaku.on("ready", (name) => console.log(`[${config.name}] Node "${name}" is ready.`));
  shoukaku.on("disconnect", (name) => console.warn(`[${config.name}] Node "${name}" disconnected.`));

  async function startStream() {
    if (isStarting) return;
    isStarting = true;

    try {
      const guild = client.guilds.cache.get(config.guildId);
      if (!guild) { console.error(`[${config.name}] Guild not found.`); return; }

      const voiceChannel = guild.channels.cache.get(config.voiceChannelId);
      if (!voiceChannel) { console.error(`[${config.name}] Voice channel not found.`); return; }

      const permissions = voiceChannel.permissionsFor(guild.members.me);
      if (!permissions.has("Connect")) { console.error(`[${config.name}] No CONNECT permission.`); return; }
      if (!permissions.has("Speak")) { console.error(`[${config.name}] No SPEAK permission.`); return; }

      if (player) { try { player.destroy(); } catch (_) {} player = null; }
      try { await shoukaku.leaveVoiceChannel(config.guildId); } catch (_) {}
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`[${config.name}] Joining: ${voiceChannel.name}`);
      player = await shoukaku.joinVoiceChannel({
        guildId: config.guildId,
        channelId: config.voiceChannelId,
        shardId: guild.shardId ?? 0,
        deaf: true,
      });

      const node = shoukaku.nodes.get(player.node.name);
      if (!node) { console.error(`[${config.name}] No node available.`); return; }

      console.log(`[${config.name}] Resolving stream...`);
      const result = await node.rest.resolve(config.streamUrl);
      if (!result?.data) { console.error(`[${config.name}] Could not resolve stream URL.`); return; }

      const track = Array.isArray(result.data) ? result.data[0] : result.data;
      if (!track) { console.error(`[${config.name}] No track found.`); return; }

      await player.playTrack({ track });
      console.log(`[${config.name}] Now streaming: ${track.info?.title ?? config.streamUrl}`);

      player.removeAllListeners();

      player.on("end", async () => {
        if (!player) return;
        console.log(`[${config.name}] Stream ended. Restarting...`);
        try {
          const freshResult = await node.rest.resolve(config.streamUrl);
          const freshTrack = Array.isArray(freshResult?.data) ? freshResult.data[0] : freshResult?.data;
          if (freshTrack) {
            await player.playTrack({ track: freshTrack });
            console.log(`[${config.name}] Stream restarted.`);
          }
        } catch (err) {
          console.error(`[${config.name}] Failed to restart:`, err.message);
        }
      });

      player.on("exception", () => {
        console.error(`[${config.name}] Player exception — forcing reconnect...`);
        player = null;
      });

      player.on("stuck", () => {
        console.warn(`[${config.name}] Player stuck.`);
        player = null;
      });

    } catch (err) {
      console.error(`[${config.name}] startStream error:`, err.message);
      player = null;
    } finally {
      isStarting = false;
    }
  }

  function startReconnectLoop() {
    setInterval(async () => {
      try {
        const guild = client.guilds.cache.get(config.guildId);
        if (!guild) return;
        const inVoice = guild.members.me?.voice?.channelId === config.voiceChannelId;
        const isPlaying = player && !player.destroyed;
        if (!inVoice || !isPlaying) {
          console.log(`[${config.name}] Disconnected or not playing. Reconnecting...`);
          await startStream();
        }
      } catch (err) {
        console.error(`[${config.name}] Loop error:`, err.message);
      }
    }, config.reconnectIntervalMs);
  }

  client.once(Events.ClientReady, async () => {
    console.log(`[${config.name}] Logged in as ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: config.activity, type: ActivityType.Custom }],
      status: 'idle',
    });

    const waitForNode = () => new Promise(resolve => {
      const anyReady = [...shoukaku.nodes.values()].some(n => n.state === 1);
      if (anyReady) return resolve();
      shoukaku.once("ready", resolve);
    });

    await waitForNode();
    console.log(`[${config.name}] Lavalink ready. Starting stream...`);
    await startStream();
    startReconnectLoop();
  });

  client.on("voiceStateUpdate", async (oldState, newState) => {
    if (oldState.member?.id !== client.user?.id) return;
    if (oldState.channelId && !newState.channelId) {
      console.log(`[${config.name}] Forcefully disconnected. Will rejoin shortly...`);
      player = null;
    }
  });

  process.on("unhandledRejection", (reason) => {
    const msg = reason?.message ?? String(reason);
    if (msg.includes("sessionId") || msg.includes("session")) return;
    console.error(`[${config.name}] Unhandled rejection:`, msg);
  });

  process.on("uncaughtException", (err) => {
    console.error(`[${config.name}] Uncaught exception:`, err.message);
  });

  client.login(config.token);
}

console.log(`[Launcher] Starting ${configs.length} station bot(s)...`);
for (const config of configs) startBot(config);