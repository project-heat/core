import { Injectable } from '@nestjs/common'
import { Message } from 'discord.js'
import { Command, CommandMessage } from '../../discord/discord.decorator'

@Injectable()
export class PingCommandService {
  @Command('ping')
  public async run(@CommandMessage message: Message) {
    await message.reply(`Pong! ${message.client.ws.ping}ms`)
  }
}
