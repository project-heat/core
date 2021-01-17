import { Injectable, Type } from '@nestjs/common'
import { DiscoveryService, MetadataScanner } from '@nestjs/core'

import { DiscordCommand, DiscordCommandMetadata } from '../discord.interface'
import { DiscordReflectorService } from '../reflector/discord-reflector.service'

@Injectable()
export class DiscordCommandService extends Set<DiscordCommand> {
  public constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: DiscordReflectorService
  ) {
    super()
  }

  public init() {
    this.getProviders()
      .map(wrapper => this.scan(wrapper.instance, wrapper.metatype))
      .flat()
      .forEach(command => this.add(command))
  }

  private scan(
    instance: any,
    // eslint-disable-next-line @typescript-eslint/ban-types
    metaType: Function | Type<any>
  ): DiscordCommand[] {
    const methods = this.metadataScanner.scanFromPrototype(
      instance,
      metaType.prototype,
      name => name
    )

    return methods
      .map(methodName => ({
        methodName,
        commandMetadata: this.reflector.getCommandMetadata(
          instance[methodName]
        ),
      }))
      .filter(metadata => metadata.commandMetadata)
      .map(metadata => ({
        ...metadata,
        params: this.reflector.getCommandParamMetadata(
          metaType,
          metadata.methodName
        ),
      }))
      .map<DiscordCommand>(({ commandMetadata, methodName, params }) => ({
        ...(commandMetadata as DiscordCommandMetadata),
        params,
        callback: (instance[methodName] as Type<any>).bind(instance),
      }))
  }

  private getProviders() {
    return this.discovery
      .getProviders()
      .filter(wrapper => wrapper.isDependencyTreeStatic())
      .filter(wrapper => wrapper.instance)
      .filter(wrapper => wrapper.metatype)
  }
}
