export interface DiscordEventMetadata {
  eventName: string
  once: boolean
}

export interface DiscordCommandMetadata {
  commandName: string
  commandArgs?: string
}

export type DiscordChildCommandMetadata = DiscordCommandMetadata

export interface DiscordEvent extends DiscordEventMetadata {
  callback: (...args: any[]) => void
}

export type DiscordCommandParamType = 'ARGUMENT' | 'MESSAGE'

export type DiscordCommandMessageMetadata = {
  paramType: 'MESSAGE'
  parameterIndex: number
}

export type DiscordCommandArgumentMetadata = {
  paramType: 'ARGUMENT'
  parameterIndex: number
  argumentName: string
}

export type DiscordCommandParamMetadata =
  | DiscordCommandMessageMetadata
  | DiscordCommandArgumentMetadata

export interface DiscordChildCommand {
  commandName: string
  commandArgs?: string
  params: DiscordCommandParamMetadata[]
  callback: (...args: any[]) => void | Promise<void>
}

export interface DiscordParentCommand {
  commandName: string
  children: DiscordChildCommand[]
}

export interface DiscordCommand extends DiscordCommandMetadata {
  params: DiscordCommandParamMetadata[]
  callback: (...args: any[]) => void | Promise<void>
}
