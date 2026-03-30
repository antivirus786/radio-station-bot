# 📻 Radio Station Bot — Discord

A self-hosted Discord bot that streams a **24/7 live audio feed** into a voice channel using **Lavalink v4 + Shoukaku**. Works with a single bot token out of the box, and optionally scales to multiple independent radio stations — each with its own token, channel, and stream URL — all running from one process.

---

## ✨ Features

- 🎙️ **24/7 Continuous Streaming** — Plays a YouTube stream or URL non-stop in a voice channel
- 🔁 **Auto-Restart on End** — If a stream ends or drops, it immediately re-resolves and resumes
- 🔌 **Auto-Reconnect Loop** — Checks every 30 seconds if the bot is still in VC and playing; rejoins if not
- 💥 **Crash Recovery** — Handles player exceptions, stuck events, and force-disconnects gracefully
- 🌐 **Multi-Node Lavalink Support** — Each station can have a primary and fallback Lavalink node
- 📡 **Multi-Station Support** *(optional)* — Run multiple radio bots from a single `node index.js` command
- 🎭 **Custom Status per Station** — Each bot displays its own custom activity/status message
- 🔒 **Permission Checks** — Validates `Connect` and `Speak` permissions before attempting to join
- ⚡ **IPv4 Forced** — DNS and network stack hardened to avoid IPv6 connection issues

---

## 🛠️ Tech Stack

| Library | Purpose |
|---|---|
| `discord.js` v14 | Discord API client |
| `shoukaku` v4 | Lavalink v4 wrapper |
| `Lavalink` | Audio streaming node (self-hosted or public) |
| `Node.js` | Runtime |

---

## 📋 Prerequisites

- **Node.js** v18 or higher
- **A running Lavalink v4 node** — self-hosted or a public one
- **A Discord Bot Token** from the [Discord Developer Portal](https://discord.com/developers/applications)
- **Bot Permissions:** `Connect`, `Speak`, `View Channel`

---

## ⚙️ Installation

**1. Clone the repository**
```bash
git clone https://github.com/antivirus786/radio-station-bot.git
cd radio-station-bot
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure your station**

Open `config.js` and fill in your details:

```js
module.exports = [
  {
    name: "MyRadio",                              // Display name (for console logs)
    token: "YOUR_BOT_TOKEN_HERE",                 // Your Discord bot token
    guildId: "YOUR_SERVER_ID",                    // The server to stream in
    voiceChannelId: "YOUR_VOICE_CHANNEL_ID",      // The voice channel to join
    streamUrl: "https://www.youtube.com/watch?v=XXXXXXXXXXX", // Stream URL
    activity: "🎵 vibing 24/7",                  // Bot's custom status
    reconnectIntervalMs: 30_000,                  // Reconnect check every 30s
    lavalink: [
      { name: "Node1", url: "your-lavalink-host:2333", auth: "your-password", secure: false },
    ],
  },
];
```

**4. Start the bot**
```bash
npm start
```
or
```bash
node index.js
```

---

## 📡 Optional: Multi-Station Setup

Want to run **multiple radio stations** at once? Just add more entries to `config.js` — each with its own bot token, voice channel, and stream URL. They all run in the same process:

```js
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
      { name: "Node1", url: "lavalink-host:2333", auth: "password", secure: false },
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
      { name: "Node1", url: "lavalink-host:2333", auth: "password", secure: false },
    ],
  },
];
```

Each station runs independently — if one crashes or disconnects, it doesn't affect the others.

---

## 🗂️ Project Structure

```
radio-station-bot/
├── index.js        # Core bot logic — streaming, reconnect loop, crash recovery
├── config.js       # Station configuration (tokens, channels, stream URLs)
├── package.json    # Dependencies
└── README.md
```

---

## 📟 Example Console Output

```
[Launcher] Starting 2 station bot(s)...
[ChillStation] Logged in as ChillBot#1234
[ChillStation] Node "Node1" is ready.
[ChillStation] Lavalink ready. Starting stream...
[ChillStation] Joining: 🎵 Lo-Fi Radio
[ChillStation] Now streaming: lofi hip hop radio 📚

[HypeStation] Logged in as HypeBot#5678
[HypeStation] Node "Node1" is ready.
[HypeStation] Lavalink ready. Starting stream...
[HypeStation] Joining: 🔥 Hype Radio
[HypeStation] Now streaming: 24/7 Hype Music Live
```

---

## 🔄 How the Reconnect System Works

1. On startup, the bot waits for a Lavalink node to become ready
2. It joins the configured voice channel and begins streaming
3. Every `reconnectIntervalMs` (default: 30s), it checks:
   - Is the bot still in the correct voice channel?
   - Is the player still active and not destroyed?
4. If either check fails, it automatically rejoins and restarts the stream
5. If the bot is force-disconnected by a moderator, it detects the voice state update and flags itself for reconnection

---

## 🔒 Security — Important

**Never commit real bot tokens to GitHub.** Before pushing, make sure your `config.js` only has placeholder values, or move tokens to a `.env` file.

Add a `.gitignore`:
```
node_modules/
.env
```

If you accidentally exposed a token, **invalidate it immediately** in the [Discord Developer Portal](https://discord.com/developers/applications) and generate a new one.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is open source. Feel free to use, modify, and distribute it.
