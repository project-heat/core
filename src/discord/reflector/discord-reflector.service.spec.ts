/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing'

import {
  ChildCommand,
  Command,
  CommandMessage,
  CommandParam,
  DiscordEvent,
  ParentCommand,
} from '../discord.decorator'
import { DiscordReflectorService } from './discord-reflector.service'

describe('DiscordService', () => {
  let service: DiscordReflectorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordReflectorService],
    }).compile()

    service = module.get<DiscordReflectorService>(DiscordReflectorService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('getEventMetadata', () => {
    class TestEvent {
      @DiscordEvent('ready')
      static onReady() {}

      @DiscordEvent('disconnect', true)
      static onDisconnect() {}
    }

    const readyMetadata = service.getEventMetadata(TestEvent.onReady)
    const disconnectMetadata = service.getEventMetadata(TestEvent.onDisconnect)

    expect(readyMetadata).toBeDefined()
    expect(readyMetadata?.eventName).toEqual('ready')
    expect(readyMetadata?.once).toEqual(false)

    expect(disconnectMetadata).toBeDefined()
    expect(disconnectMetadata?.eventName).toEqual('disconnect')
    expect(disconnectMetadata?.once).toEqual(true)
  })

  it('getCommandMetadata', () => {
    class TestCommand {
      @Command('ping')
      static ping() {}

      @Command('say', ':message')
      static say() {}
    }

    const sayMetadata = service.getCommandMetadata(TestCommand.say)
    const pingMetadata = service.getCommandMetadata(TestCommand.ping)

    expect(sayMetadata).toBeDefined()
    expect(sayMetadata?.commandName).toEqual('say')
    expect(sayMetadata?.commandArgs).toEqual(':message')

    expect(pingMetadata).toBeDefined()
    expect(pingMetadata?.commandName).toEqual('ping')
    expect(pingMetadata?.commandArgs).toBeUndefined()
  })

  it('getParentCommandMetadata', () => {
    @ParentCommand('test')
    class TestCommand {}

    const metadata = service.getParentCommandMetadata(TestCommand)

    expect(metadata).toEqual('test')
  })

  it('getChildCommandMetadata', () => {
    class TestCommand {
      @ChildCommand('test')
      static onTest1() {}

      @ChildCommand('test', ':foo')
      static onTest2() {}
    }

    const test1Metadata = service.getChildCommandMetadata(TestCommand.onTest1)
    const test2Metadata = service.getChildCommandMetadata(TestCommand.onTest2)

    expect(test1Metadata).toBeDefined()
    expect(test1Metadata?.commandName).toEqual('test')
    expect(test1Metadata?.commandArgs).toBeUndefined()

    expect(test2Metadata).toBeDefined()
    expect(test2Metadata?.commandName).toEqual('test')
    expect(test2Metadata?.commandArgs).toEqual(':foo')
  })

  it('getCommandParamMetadata', () => {
    class TestParam {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      static test1(@CommandMessage _message: unknown) {}

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      static test2(@CommandParam('foo') _foo: string) {}

      static test3(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @CommandMessage _message: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @CommandParam('bar') _bar: string
      ) {}
    }

    const test1Metadata = service.getCommandParamMetadata(
      TestParam.constructor,
      'test1'
    )
    const test2Metadata = service.getCommandParamMetadata(
      TestParam.constructor,
      'test2'
    )
    const test3Metadata = service
      .getCommandParamMetadata(TestParam.constructor, 'test3')
      .sort((a, b) => a.parameterIndex - b.parameterIndex)

    const test4Metadata = service.getCommandParamMetadata(
      TestParam.constructor,
      'empty'
    )

    expect(test1Metadata).toHaveLength(1)
    expect(test1Metadata[0]).toBeDefined()
    expect(test1Metadata[0].paramType).toEqual('MESSAGE')
    expect(test1Metadata[0].parameterIndex).toEqual(0)

    expect(test2Metadata).toHaveLength(1)
    expect(test2Metadata[0]).toBeDefined()
    expect(test2Metadata[0].paramType).toEqual('ARGUMENT')
    expect(test2Metadata[0].parameterIndex).toEqual(0)

    expect(test3Metadata).toHaveLength(2)
    expect(test3Metadata[0]).toBeDefined()
    expect(test3Metadata[0].paramType).toEqual('MESSAGE')
    expect(test3Metadata[0].parameterIndex).toEqual(0)
    expect(test3Metadata[1]).toBeDefined()
    expect(test3Metadata[1].paramType).toEqual('ARGUMENT')
    expect(test3Metadata[1].parameterIndex).toEqual(1)

    expect(test4Metadata).toBeDefined()
    expect(Array.isArray(test4Metadata)).toEqual(true)
    expect(test4Metadata).toHaveLength(0)
  })
})
