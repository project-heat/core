# nest-discordjs-template

![Node.js CI](https://github.com/InkoHX/nest-discord-commander/workflows/Node.js%20CI/badge.svg)

## Description

This is a template for using Discord.js with Nest.js.

## Example

### EventHandler

```ts
@Injectable()
export class GuildMemberAddEvent {
  @DiscordEvent('guildMemberAdd')
  onGuildMemberAdd(member: GuildMember) {
    // your code
  }
}
```

### ParentCommand & ChildCommand

```ts
@Injectable()
@ParentCommand('math')
export class MathCommandService {
  @ChildCommand('sum', ':num1 :num2')
  public async sum(
    @CommandMessage message: Message,
    @CommandParam('num1') num1: string,
    @CommandParam('num2') num2: string
  ) {
    const result = [num1, num2]
      .map(Number)
      .reduce((a, b) => a + b)

    await message.reply(result)
  }
}
```

### Single Command

```ts
@Injectable()
export class SumCommandService {
  @Command('sum', ':num1 :num2')
  public async sum(
    @CommandMessage message: Message,
    @CommandParam('num1') num1: string,
    @CommandParam('num2') num2: string
  ) {
    const result = [num1, num2]
      .map(Number)
      .reduce((a, b) => a + b)

    await message.reply(result)
  }
}
```

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## License

This template is [MIT licensed](LICENSE).
