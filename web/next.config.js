import os from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
	trailingSlash: true,
	webpack: (config, { dev, isServer, webpack, nextRuntime }) => {
		config.module.rules.push({
			test: /\.node$/,
			use: [
				{
					loader: 'nextjs-node-loader',
					options: {
						flags: os.constants.dlopen.RTLD_NOW,
						outputPath: config.output.path
					}
				}
			]
		});
		return config;
	}
};

export default nextConfig;
