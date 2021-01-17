/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DiscoveryModule } from '@nestjs/core'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { Test, TestingModule } from '@nestjs/testing'

import {
  ChildCommand,
  CommandMessage,
  CommandParam,
  ParentCommand,
} from '../discord.decorator'
import { DiscordChildCommand, DiscordParentCommand } from '../discord.interface'
import { DiscordReflectorService } from '../reflector/discord-reflector.service'
import { DiscordParentCommandService } from './discord-parent-command.service'

describe('DiscordService', () => {
  let service: DiscordParentCommandService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordReflectorService, DiscordParentCommandService],
      imports: [DiscoveryModule],
    }).compile()

    service = module.get<DiscordParentCommandService>(
      DiscordParentCommandService
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('init', () => {
    @ParentCommand('foo')
    class TestCommand {
      @ChildCommand('bar', ':hoge')
      bar(
        @CommandMessage _message: unknown,
        @CommandParam('hoge') _hoge: string
      ) {}
    }

    jest
      .spyOn<DiscordParentCommandService, any>(service, 'getProviders')
      .mockReturnValueOnce([
        {
          instance: new TestCommand(),
          metatype: TestCommand,
        },
      ] as Array<Partial<InstanceWrapper<any>>>)

    service.init()

    const commands = [...service]

    expect(commands).toHaveLength(1)
    expect(commands[0]).toEqual(
      expect.objectContaining<DiscordParentCommand>({
        commandName: 'foo',
        children: [
          {
            commandName: 'bar',
            commandArgs: ':hoge',
            callback: expect.any(Function),
            params: [
              {
                paramType: 'MESSAGE',
                parameterIndex: 0,
              },
              {
                paramType: 'ARGUMENT',
                argumentName: 'hoge',
                parameterIndex: 1,
              },
            ],
          },
        ],
      })
    )

    service.clear()
  })

  describe('scan', () => {
    @ParentCommand('foo')
    class Test1 {
      @ChildCommand('bar')
      bar(@CommandMessage _message: unknown) {}

      @ChildCommand('hoge', ':piyo')
      hoge(
        @CommandMessage _message: unknown,
        @CommandParam('piyo') _piyo: string
      ) {}
    }

    class Test2 {}

    it('DiscordParentCommand should be returned if the target decorator exists', () => {
      const scanResult = service['scan'](new Test1(), Test1)

      expect(scanResult).toBeDefined()
      expect(scanResult?.commandName).toEqual('foo')

      expect(scanResult?.children[0]).toEqual(
        expect.objectContaining<DiscordChildCommand>({
          callback: expect.any(Function),
          commandName: 'bar',
          commandArgs: undefined,
          params: [
            {
              paramType: 'MESSAGE',
              parameterIndex: 0,
            },
          ],
        })
      )

      expect(scanResult?.children[1]).toEqual(
        expect.objectContaining<DiscordChildCommand>({
          callback: expect.any(Function),
          commandName: 'hoge',
          commandArgs: ':piyo',
          params: [
            {
              paramType: 'MESSAGE',
              parameterIndex: 0,
            },
            {
              paramType: 'ARGUMENT',
              argumentName: 'piyo',
              parameterIndex: 1,
            },
          ],
        })
      )
    })

    it('Should return null if the target decorator does not exist.', () => {
      expect(service['scan'](new Test2(), Test2)).toBeNull()
    })
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
