import { Injectable } from '@nestjs/common'
import { Client } from 'discord.js'

@Injectable()
export class DiscordService extends Client {
  public readonly commandPrefix = '$>'
}
