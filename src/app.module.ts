import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DiscordCommandModule } from './discord-command/discord-command.module'
import { DiscordEventModule } from './discord-event/discord-event.module'
import { DiscordModule } from './discord/discord.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    DiscordModule,
    DiscordCommandModule,
    DiscordEventModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
