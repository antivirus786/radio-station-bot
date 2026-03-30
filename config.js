module.exports = [
  {
    name: "ChillStation",
    token: "FIRST_BOT_TOKEN",
    guildId: "YOUR_SERVER_ID",
    voiceChannelId: "CHANNEL_ID_1",
    streamUrl: "https://www.youtube.com/watch?v=AAAAAAAAAAA",
    activity: "☁️ lo-fi 24/7",
    reconnectIntervalMs: 30_000,
    lavalink: [
      { name: "Node1", url: "lavalink.jirayu.net:443", auth: "youshallnotpass", secure: true },
      { name: "Node2", url: "lavalink.jirayu.net:13592", auth: "youshallnotpass", secure: false },
    ],
  },
  {
    name: "HypeStation",
    token: "SECOND_BOT_TOKEN",
    guildId: "YOUR_SERVER_ID",
    voiceChannelId: "CHANNEL_ID_2",
    streamUrl: "https://www.youtube.com/watch?v=BBBBBBBBBBB",
    activity: "🔥 non-stop bangers",
    reconnectIntervalMs: 30_000,
    lavalink: [
      { name: "Node1", url: "lavalink.jirayu.net:443", auth: "youshallnotpass", secure: true },
      { name: "Node2", url: "lavalink.jirayu.net:13592", auth: "youshallnotpass", secure: false },
    ],
  },
];
