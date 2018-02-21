import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  external: ['react'],

	plugins: [
		typescript()
	]
}
