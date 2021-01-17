import { Module } from '@nestjs/common'

import { DiscordModule } from '../discord/discord.module'
import { PingCommandService } from './ping-command/ping-command.service'

@Module({
  providers: [PingCommandService],
  imports: [DiscordModule],
})
export class DiscordCommandModule {}
