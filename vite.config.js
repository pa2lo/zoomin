import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
// import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
	plugins: [/* mkcert(),  */solid()],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: `assets/[name].js`,
				chunkFileNames: `assets/[name].js`,
				assetFileNames: `assets/[name].[ext]`
			}
		}
	}
})
