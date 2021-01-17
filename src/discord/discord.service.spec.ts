import { Test, TestingModule } from '@nestjs/testing'
import { Client } from 'discord.js'

import { DiscordService } from './discord.service'

describe('DiscordService', () => {
  let service: DiscordService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordService],
    }).compile()

    service = module.get<DiscordService>(DiscordService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('DiscordJS.Client should be extended', () => {
    expect(service).toBeInstanceOf(Client)
  })
})
