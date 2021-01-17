/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { DiscoveryModule } from '@nestjs/core'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { Test, TestingModule } from '@nestjs/testing'
import { Command, CommandMessage, CommandParam } from '../discord.decorator'

import { DiscordReflectorService } from '../reflector/discord-reflector.service'
import { DiscordCommandService } from './discord-command.service'

describe('DiscordService', () => {
  let service: DiscordCommandService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordReflectorService, DiscordCommandService],
      imports: [DiscoveryModule],
    }).compile()

    service = module.get<DiscordCommandService>(DiscordCommandService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('init', () => {
    class TestProvider {
      @Command('foo')
      foo() {}

      @Command('bar', ':hoge')
      bar() {}
    }

    const testInstance = new TestProvider()

    jest
      .spyOn<DiscordCommandService, any>(service, 'getProviders')
      .mockReturnValueOnce([
        {
          instance: testInstance,
          metatype: TestProvider,
        },
      ])

    service.init()

    const commands = [...service]

    expect(service.size).toEqual(2)
    expect(commands[0].commandName).toEqual('foo')
    expect(commands[0].commandArgs).toBeUndefined()
    expect(commands[0].params).toHaveLength(0)
    expect(typeof commands[0].callback === 'function').toBeTruthy()

    expect(commands[1].commandName).toEqual('bar')
    expect(commands[1].commandArgs).toEqual(':hoge')
    expect(commands[1].params).toHaveLength(0)
    expect(typeof commands[1].callback === 'function').toBeTruthy()
  })

  it('scan', () => {
    class TestCommand {
      @Command('foo')
      foo() {}

      @Command('bar', ':hoge')
      bar() {}

      hoge() {}

      @Command('fuga', ':piyo')
      fuga(
        @CommandMessage _message: unknown,
        @CommandParam('piyo') _piyo: string
      ) {}
    }

    const scanResult = service['scan'](new TestCommand(), TestCommand)

    expect(scanResult).toHaveLength(3)

    expect(scanResult[0].commandName).toEqual('foo')
    expect(scanResult[0].commandArgs).toBeUndefined()
    expect(scanResult[0].params).toHaveLength(0)
    expect(typeof scanResult[0].callback === 'function').toBeTruthy()

    expect(scanResult[1].commandName).toEqual('bar')
    expect(scanResult[1].commandArgs).toEqual(':hoge')
    expect(scanResult[1].params).toHaveLength(0)
    expect(typeof scanResult[1].callback === 'function').toBeTruthy()

    expect(scanResult[2].commandName).toEqual('fuga')
    expect(scanResult[2].commandArgs).toEqual(':piyo')
    expect(typeof scanResult[2].callback === 'function').toBeTruthy()
    expect(scanResult[2].params).toHaveLength(2)
    expect(scanResult[2].params[0].paramType === 'MESSAGE').toBeTruthy()
    expect(scanResult[2].params[0].parameterIndex).toEqual(0)
    expect(scanResult[2].params[1].paramType === 'ARGUMENT').toBeTruthy()
    expect(scanResult[2].params[1].parameterIndex).toEqual(1)
  })

  it('getProviders', () => {
    const providers = service['getProviders']()

    expect(
      providers.every(wrapper => wrapper.isDependencyTreeStatic())
    ).toBeTruthy()
    expect(providers.every(wrapper => wrapper.instance)).toBeTruthy()
    expect(providers.every(wrapper => wrapper.metatype)).toBeTruthy()
  })
})
