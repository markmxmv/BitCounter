import css from 'rollup-plugin-import-css';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import rollupNodeResolve from 'rollup-plugin-node-resolve'
import rollupJson from 'rollup-plugin-json'

export default {
	input: "src/app.js",
	output: {
		dir: "dist",
		format: "esm"
	},
	plugins: [css({output: "bundle.css"}), nodeResolve(), rollupNodeResolve({ jsnext: true, preferBuiltins: true, browser: true }),
    rollupJson()]
}