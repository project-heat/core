import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

import { PrismaService } from './prisma.service'

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule implements OnModuleInit, OnModuleDestroy {
  public constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    await this.prismaService.$connect()
  }

  async onModuleDestroy() {
    await this.prismaService.$disconnect()
  }
}
