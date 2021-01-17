import { Test, TestingModule } from '@nestjs/testing'

import { DiscordModule } from '../../discord/discord.module'
import { MessageService } from './message.service'

describe('MessageService', () => {
  let service: MessageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageService],
      imports: [DiscordModule],
    }).compile()

    service = module.get<MessageService>(MessageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
