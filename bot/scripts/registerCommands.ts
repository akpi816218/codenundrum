import { REST, Routes } from 'discord.js';
import { dirname, join } from 'path';
import { clientId } from '../src/config';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';
import TypedJsoning from 'typed-jsoning';
import { SerializedCommandHelpEntry } from '../src/lib/CommandHelpEntry';
import { Command } from '../src/lib/discord/types';

export const commandsPath = join(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'src',
	'commands'
);

export async function registerCommands(
	token: string,
	commandFiles?: string[]
): Promise<{
	data: unknown;
	getCommands: () => Promise<unknown>;
	rest: REST;
}> {
	// eslint-disable-next-line no-param-reassign
	commandFiles =
		commandFiles ??
		(await readdir(commandsPath)).filter(file => file.endsWith('.ts'));
	const cmndb = new TypedJsoning<SerializedCommandHelpEntry>(
		'botfiles/cmnds.db.json'
	);
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);
		const command: Command = await import(filePath);
		if (command.help) cmndb.set(command.data.name, command.help.toJSON());
	}
	const commands = [];
	for (const file of commandFiles)
		commands.push(
			((await import(join(commandsPath, file))) as Command).data.toJSON()
		);
	let data: unknown;
	const rest = new REST().setToken(token);
	await rest.put(Routes.applicationCommands(clientId), {
		body: commands
	});
	return {
		data,
		getCommands: async () =>
			await rest.get(Routes.applicationCommands(clientId)),
		rest
	};
}
