import { SetMetadata } from '@nestjs/common'
import { ClientEvents } from 'discord.js'

import {
  DiscordCommandArgumentMetadata,
  DiscordCommandMessageMetadata,
  DiscordCommandParamMetadata,
  DiscordCommandParamType,
} from './discord.interface'

export const DISCORD_EVENT = Symbol('DISCORD_EVENT')
export const DISCORD_COMMAND = Symbol('DISCORD_COMMAND')
export const DISCORD_PARENT_COMMAND = Symbol('DISCORD_PARENT_COMMAND')
export const DISCORD_CHILD_COMMAND = Symbol('DISCORD_COMMAND_ARGUMENT')
export const DISCORD_COMMAND_PARAM = Symbol('DISCORD_COMMAND_PARAM')

export const DiscordEvent = (
  eventName: keyof ClientEvents,
  once = false
): MethodDecorator => SetMetadata(DISCORD_EVENT, { eventName, once })

const createCommandParamDecorator = (paramType: DiscordCommandParamType) => (
  argumentName?: string
): ParameterDecorator => (target, propertyKey, parameterIndex) => {
  const metadata: DiscordCommandParamMetadata[] =
    Reflect.getMetadata(
      DISCORD_COMMAND_PARAM,
      target.constructor,
      propertyKey
    ) ?? []

  if (paramType === 'MESSAGE') {
    Reflect.defineMetadata(
      DISCORD_COMMAND_PARAM,
      [
        ...metadata,
        {
          paramType,
          parameterIndex,
        } as DiscordCommandMessageMetadata,
      ],
      target.constructor,
      propertyKey
    )
  } else {
    Reflect.defineMetadata(
      DISCORD_COMMAND_PARAM,
      [
        ...metadata,
        {
          paramType,
          argumentName,
          parameterIndex,
        } as DiscordCommandArgumentMetadata,
      ],
      target.constructor,
      propertyKey
    )
  }
}

export const Command = (
  commandName: string,
  commandArgs?: string
): MethodDecorator => SetMetadata(DISCORD_COMMAND, { commandName, commandArgs })

export const ParentCommand = (commandName: string): ClassDecorator =>
  SetMetadata(DISCORD_PARENT_COMMAND, commandName)

export const ChildCommand = (
  commandName: string,
  commandArgs?: string
): MethodDecorator =>
  SetMetadata(DISCORD_CHILD_COMMAND, { commandName, commandArgs })

export const CommandParam = createCommandParamDecorator('ARGUMENT')
export const CommandMessage = createCommandParamDecorator('MESSAGE')()
