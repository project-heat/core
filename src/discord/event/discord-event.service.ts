import { Injectable, Type } from '@nestjs/common'
import { DiscoveryService, MetadataScanner } from '@nestjs/core'

import { DiscordEvent, DiscordEventMetadata } from '../discord.interface'
import { DiscordService } from '../discord.service'
import { DiscordReflectorService } from '../reflector/discord-reflector.service'

@Injectable()
export class DiscordEventService {
  public constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: DiscordReflectorService,
    private readonly bot: DiscordService
  ) {}

  public init() {
    this.getProviders()
      .map(wrapper => this.scan(wrapper.instance))
      .flat()
      .forEach(({ eventName, once, callback }) =>
        once
          ? this.bot.once(eventName, callback)
          : this.bot.on(eventName, callback)
      )
  }

  private scan(instance: any): DiscordEvent[] {
    const methods = this.metadataScanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      name => name
    )

    return methods
      .map(methodName => ({
        methodName,
        metadata: this.reflector.getEventMetadata(instance[methodName]),
      }))
      .filter(({ metadata }) => metadata)
      .map(({ metadata, methodName }) => ({
        ...(metadata as DiscordEventMetadata),
        callback: (instance[methodName] as Type<any>).bind(instance),
      }))
  }

  private getProviders() {
    return this.discovery
      .getProviders()
      .filter(wrapper => wrapper.isDependencyTreeStatic())
      .filter(wrapper => wrapper.instance)
  }
}
