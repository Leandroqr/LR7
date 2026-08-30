import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
	...nextVitals,
	...nextTypeScript,
	{
		ignores: [
			"node_modules/**",
			".next/**",
			"dist/**",
		],
		rules: {
			"react-hooks/set-state-in-effect": "off",
			"react-hooks/static-components": "off",
		},
	},
];

export default config;
