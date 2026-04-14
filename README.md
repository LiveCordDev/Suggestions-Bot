# Suggestions Bot

A powerful suggestion system for Discord servers with voting, moderation, and automatic logging.

## Features

- Submit suggestions with prefix or slash commands
- Upvote/Downvote system with buttons
- Auto-logging when suggestions reach vote threshold
- Moderation commands (approve, deny, consider)
- Admin configuration commands
- MongoDB database for persistent storage
- Rate limit protection
- User-specific help menu with modules
- Ephemeral responses (only user can see)

## Commands

### General
| Command | Description |
|---------|-------------|
| `&suggest <text>` | Submit a suggestion to the server |
| `/suggest <text>` | Submit a suggestion using slash command |

### Admin (Manage Server permission required)
| Command | Description |
|---------|-------------|
| `&setsuggest #channel` | Set the channel where suggestions are posted |
| `&removesuggest` | Remove the configured suggestion channel |
| `&setlogs #channel` | Set the channel for high-vote suggestion logs |
| `&setthreshold <number>` | Set upvotes needed to forward to logs (default: 5) |

### Moderation (Manage Messages permission required)
| Command | Description |
|---------|-------------|
| `&approve <id>` | Approve a suggestion |
| `&deny <id>` | Deny a suggestion |
| `&consider <id>` | Mark a suggestion as under consideration |

### Help
| Command | Description |
|---------|-------------|
| `&help` | Show help menu with all commands |

## Installation

### Prerequisites
- Node.js v16 or higher
- MongoDB database (Atlas or local)
- Discord Bot Token

### Step 1: Clone the repository
```bash
git clone https://github.com/LiveCord/suggestion-bot.git
cd suggestion-bot
