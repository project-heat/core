import { Test, TestingModule } from '@nestjs/testing'

import { PingCommandService } from './ping-command.service'

describe('PingCommandService', () => {
  let service: PingCommandService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PingCommandService],
    }).compile()

    service = module.get<PingCommandService>(PingCommandService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
