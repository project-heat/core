import { Injectable, Type } from '@nestjs/common'
import { DiscoveryService, MetadataScanner } from '@nestjs/core'

import {
  DiscordChildCommand,
  DiscordChildCommandMetadata,
  DiscordParentCommand,
} from '../discord.interface'
import { DiscordReflectorService } from '../reflector/discord-reflector.service'

@Injectable()
export class DiscordParentCommandService extends Set<DiscordParentCommand> {
  public constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: DiscordReflectorService
  ) {
    super()
  }

  public init() {
    this.getProviders()
      .map(wrapper => this.scan(wrapper.instance, wrapper.metatype) ?? [])
      .flat()
      .forEach(parentCommand => this.add(parentCommand))
  }

  private scan(
    instance: any,
    // eslint-disable-next-line @typescript-eslint/ban-types
    metaType: Function | Type<any>
  ): DiscordParentCommand | null {
    const commandName = this.reflector.getParentCommandMetadata(metaType)

    if (!commandName) return null

    const methods = this.metadataScanner.scanFromPrototype(
      instance,
      metaType.prototype,
      name => name
    )
    const children = methods
      .map(methodName => ({
        methodName,
        childMetadata: this.reflector.getChildCommandMetadata(
          instance[methodName]
        ),
      }))
      .filter(metadata => metadata.childMetadata)
      .map(({ methodName, childMetadata }) => ({
        methodName,
        childMetadata: childMetadata as DiscordChildCommandMetadata,
        params: this.reflector.getCommandParamMetadata(metaType, methodName),
      }))
      .map<DiscordChildCommand>(({ childMetadata, params, methodName }) => ({
        callback: (instance[methodName] as Type<any>).bind(instance),
        commandName: childMetadata.commandName,
        commandArgs: childMetadata.commandArgs,
        params,
      }))

    return {
      commandName,
      children,
    }
  }

  private getProviders() {
    return this.discovery
      .getProviders()
      .filter(wrapper => wrapper.isDependencyTreeStatic())
      .filter(wrapper => wrapper.instance)
      .filter(wrapper => wrapper.metatype)
  }
}
