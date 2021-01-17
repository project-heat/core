/* eslint-disable @typescript-eslint/no-empty-function */
import { DiscoveryModule } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

import { DiscordEvent } from '../discord.decorator'
import { DiscordService } from '../discord.service'
import { DiscordReflectorService } from '../reflector/discord-reflector.service'
import { DiscordEventService } from './discord-event.service'

describe('DiscordService', () => {
  let service: DiscordEventService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordEventService, DiscordService, DiscordReflectorService],
      imports: [DiscoveryModule],
    }).compile()

    service = module.get<DiscordEventService>(DiscordEventService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('init', () => {
    class TestEvent {
      @DiscordEvent('ready')
      ready() {}

      @DiscordEvent('disconnect', true)
      disconnect() {}
    }

    jest
      .spyOn<DiscordEventService, any>(service, 'getProviders')
      .mockReturnValueOnce([
        {
          instance: new TestEvent(),
        },
      ])

    service.init()

    expect(service['bot'].listenerCount('ready')).toEqual(1)
    expect(service['bot'].listenerCount('disconnect')).toEqual(1)
  })

  describe('scan', () => {
    class TestEvent1 {
      @DiscordEvent('ready')
      ready() {}

      disconnect() {}
    }

    class TestEvent2 {}

    it('DiscordEvent should be returned in an array if the target decorator exists', () => {
      const scanResult = service['scan'](new TestEvent1())

      expect(scanResult).toHaveLength(1)
      expect(scanResult[0].eventName).toEqual('ready')
      expect(scanResult[0].once).toEqual(false)
      expect(typeof scanResult[0].callback === 'function').toBeTruthy()
    })

    it('Should return an empty array if none of the target decorators exist', () => {
      const scanResult = service['scan'](new TestEvent2())

      expect(Array.isArray(scanResult)).toBeTruthy()
      expect(scanResult).toHaveLength(0)
    })
  })

  it('getProviders', () => {
    const providers = service['getProviders']()

    expect(providers.every(wrapper => wrapper.instance)).toEqual(true)
    expect(
      providers.every(wrapper => wrapper.isDependencyTreeStatic())
    ).toEqual(true)
  })
})
