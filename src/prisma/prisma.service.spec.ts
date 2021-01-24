import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'

import { PrismaService } from './prisma.service'

describe('PrismaService', () => {
  let service: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile()

    service = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('PrismaClient should be extended', () => {
    expect(service).toBeInstanceOf(PrismaClient)
  })
})
