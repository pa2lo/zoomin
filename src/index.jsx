/* @refresh reload */
import { render } from 'solid-js/web'

import './App.css'
import App from './App'

const root = document.getElementById('root')

render(() => <App />, root)

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register('/sw.js');
}