import { createSignal, onMount, Show } from 'solid-js'
import Icon from './components/Icon'
import Button from './components/Button'
import IcoButton from './components/IcoButton'
import FilterButton from './components/FilterButton'
import SettingLabel from './components/SettingLabel'
import PointerObserver from './components/PointerObserver'
import createPreview from './components/Preview'
import createWizard from './components/Wizard'

function App() {
	// signals
	const [zoom, setZoom] = createSignal(null)
	const [zoomData, setZoomData] = createSignal({ min: 0, max: 10, step: 1	}, { equals: false })

	const [expo, setExpo] = createSignal(null)
	const [expoData, setExpoData] = createSignal({ min: -1, max: 1, step: 0.1 }, { equals: false })

	const [torch, setTorch] = createSignal(null)
	const [frontCamera, setFrontCamera] = createSignal(null)
	const [freeze, setFreeze] = createSignal(false)
	const [multiplied, setMultiplied] = createSignal(false)

	const [filter, setFilter] = createSignal('None')
	const [showFilters, setShowFilters] = createSignal(false)

	const [showInstallPrompt, setShowInstallPrompt] = createSignal(false)
	const [hasInstallPrompt, setHasInstallPrompt] = createSignal(false)

	const [infoActive, setInfoActive] = createSignal(false)

	// settings
	let settings = localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings')) : {}

	const [showSettings, setShowSettings] = createSignal(false)
	const [settingHideZoom, setSettingHideZoom] = createSignal(settings.hideZoom || false)
	const [settingHideExpo, setSettingHideExpo] = createSignal(settings.hideExpo || false)
	const [settingDIsableGestures, setSettingDisableGestures] = createSignal(settings.disableGestures || false)
	const [settingSmallerButtons, setSettingSmallerButtons] = createSignal(settings.smallerButtons || false)

	// Preview
	const { Preview, setPreview, downloadImage } = createPreview()

	// wizard
	const { Wizard, runWizard } = createWizard()

	// refs
	let videoEl, previewEl, zoomSlider, expoSlider, infoEl

	// other vars
	let rearCameraId, frontCameraId, torchCameraId, currentCameraId, videoStream, videoStreamTrack, torchStreamTrack

	const [zoomMoveStep, setZoomMoveStep] = createSignal(1)
	const [expoMoveStep, setExpoMoveStep] = createSignal(1)

	let torchCache
	let torchCache2
	let installPrompt
	let infoTimeout

	// actions
	function toggleFreeze() {
		if (freeze()) {
			if (torch() != torchCache) updateTorch(torchCache)
			videoEl.play()
			setFreeze(false)
			return
		}

		videoEl.pause()
		torchCache = torch()
		if (torchCache == true) updateTorch(false)
		setPreview(videoEl, multiplied())
		setFreeze(true)
	}
	function getDefaultCamera(onInit) {
		navigator.mediaDevices.getUserMedia({
			video: { facingMode: "environment" }
		}).then(stream => {
			setStream(stream, onInit)

			if (onInit) {
				navigator.mediaDevices.enumerateDevices().then((devices) => {
					devices.filter(device => device.kind == 'videoinput' && currentCameraId != device.deviceId).forEach(async device => {
						if ((torchCameraId && frontCameraId)) return

						const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: device.deviceId } })
						const tracks = stream.getVideoTracks()
						const capabilities = tracks[0].getCapabilities()
						tracks.forEach(track => track.stop())

						if (!torchCameraId && capabilities.torch) {
							setTorch(false)
							torchCameraId = device.deviceId
						}
						if (!frontCameraId && capabilities.facingMode.includes('user')) {
							setFrontCamera(false)
							frontCameraId = device.deviceId
						}
					})
				})
			}
		}).catch(error => console.log(error))
	}
	function setStream(stream, onInit) {
		const [track] = stream.getVideoTracks()
		const capabilities = track.getCapabilities()
		const settings = track.getSettings()

		videoStream = stream
		videoStreamTrack = track

		// console.log({capabilities, settings})
		currentCameraId = capabilities.deviceId
		if (onInit) rearCameraId = capabilities.deviceId

		videoStreamTrack.applyConstraints({
			advanced: [
				{
					width: Math.min(capabilities.width.max, 2048),
					resizeMode: "crop-and-scale"
				}
			]
		})

		videoEl.srcObject = stream
		videoEl.play()

		if (('zoom' in settings)) {
			setZoom(settings.zoom)
			setZoomData((data) => {
				data.min = capabilities.zoom.min
				data.max = capabilities.zoom.max
				data.step = capabilities.zoom.step
				return data
			})
		} else setZoom(null)

		if (('exposureCompensation' in settings)) {
			setExpo(settings.exposureCompensation)
			setExpoData((data) => {
				data.min = capabilities.exposureCompensation.min
				data.max = capabilities.exposureCompensation.max
				data.step = Math.min(capabilities.exposureCompensation.step, 0.1)
				return data
			})
		} else setExpo(null)

		if (onInit && !torchCameraId && capabilities.torch) {
			setTorch(false)
			torchCameraId = capabilities.deviceId
		}

		setMoveSteps()
	}
	function setMoveSteps() {
		if (zoom() != null)	setZoomMoveStep(zoomSlider.clientWidth / ((zoomData().max - zoomData().min) / zoomData().step))
		if (expo() != null) setExpoMoveStep(expoSlider.clientWidth / ((expoData().max - expoData().min) / expoData().step))
	}

	function showInfo(text) {
		clearTimeout(infoTimeout)

		infoEl.textContent = text
		setInfoActive(true)

		infoTimeout = setTimeout(() => {
			setInfoActive(false)
		}, 800)
	}

	// zoom
	function updateZoom(value) {
		if (!videoStreamTrack || zoom() == null) return

		setZoom(value)
		videoStreamTrack.applyConstraints({advanced: [ {zoom: value} ]})
		showInfo(`${parseFloat(value).toFixed(1)}X`)
	}

	// expo
	function updateExpo(value) {
		if (!videoStreamTrack || expo() == null) return

		setExpo(value)
		videoStreamTrack.applyConstraints({advanced: [ {exposureCompensation: value} ]})
		showInfo(`${value}`)
	}

	// torch
	function updateTorch(value) {
		if (!videoStreamTrack) return

		setTorch(value)
		if (torchCameraId == currentCameraId) videoStreamTrack.applyConstraints({advanced: [ {torch: value} ]})
		else if (torchStreamTrack) torchStreamTrack.applyConstraints({advanced: [ {torch: value} ]})
		else if (torchCameraId) {
			navigator.mediaDevices.getUserMedia({
				video: { deviceId: torchCameraId }
			}).then(stream => {
				const [track] = stream.getVideoTracks()
				torchStreamTrack = track
				track.applyConstraints({advanced: [ {torch: value} ]})
				track.stop()
			})
		}

		showInfo(torch() ? 'ON' : 'OFF')
	}

	// front camera
	function toggleFrontCamera() {
		if (!videoStreamTrack) return

		setFrontCamera(t => !t)

		navigator.mediaDevices.getUserMedia({
			video: { deviceId: frontCamera() ? frontCameraId : rearCameraId }
		}).then(stream => {
			setStream(stream)
		})

		if (!frontCamera()) {
			if (torch() != torchCache2) updateTorch(torchCache2)
		} else {
			torchCache2 = torch()
			if (torchCache2 == true) updateTorch(false)
		}
	}

	// computed
	const filterClass = () => {
		return `filter${filter()}`
	}

	// install
	function installApp() {
		if (!installPrompt) return

		installPrompt.prompt()
		installPrompt.userChoice.then(outcome => {
			if (outcome === 'accepted') {
				installPrompt = null
				setShowInstallPrompt(false)
				setHasInstallPrompt(false)
			}
		})
	}

	// mount
	onMount(() => {
		getDefaultCamera(true)

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === "visible") {
				getDefaultCamera()
			} else {
				if (videoStreamTrack) videoStreamTrack.stop()
			}
		})

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault()
			installPrompt = e
			setShowInstallPrompt(true)
			setHasInstallPrompt(true)
		})

		window.addEventListener('orientationchange', () => {
			setMoveSteps()
		})

		if (!localStorage.getItem('wizardComplete')) runWizard()
	})

	// settings update
	function updateSettings(callback) {
		callback

		localStorage.setItem('settings', JSON.stringify({
			hideZoom: settingHideZoom(),
			hideExpo: settingHideExpo(),
			disableGestures: settingDIsableGestures(),
			smallerButtons: settingSmallerButtons()
		}))
	}
	function restoreDefaults() {
		setSettingHideZoom(false)
		setSettingHideExpo(false)
		setSettingDisableGestures(false)
		setSettingSmallerButtons(false)
		localStorage.removeItem('settings')
	}

	// full reload
	function pageReload() {
		if (navigator.onLine) {
			if('caches' in window){
				caches.keys().then((names) => {
					names.forEach(async (name) => {
						await caches.delete(name)
					})
				})
			}
		}
		localStorage.removeItem('settings')
		localStorage.removeItem('wizardComplete')
		window.location.reload()
	}

	// wizard
	function showWizard() {
		setShowSettings(false)
		runWizard()
	}

	return (
		<>
			<video class={`${filterClass()} fixedEl videoEl ${multiplied() ? 'multiplied' : ''}`} ref={videoEl} />

			<div class={`container ${settingSmallerButtons() ? 'buttonsSmaller' : 'buttonsNormal'}`}>
				<div class="sliders">
					<Show when={!settingDIsableGestures()}>
						<PointerObserver zoom={zoom()} zoomData={zoomData()} updateZoom={v => updateZoom(v)} expo={expo()} expoData={expoData()} updateExpo={v => updateExpo(v)} zoomMoveStep={zoomMoveStep()} expoMoveStep={expoMoveStep()} />
					</Show>
					<Show when={!settingHideZoom()}>
						<input
							class="slider sliderZoom"
							type="range"
							min={zoomData().min}
							max={zoomData().max}
							step={zoomData().step}
							value={zoom()}
							disabled={zoom() == null}
							onInput={(e) => updateZoom(e.currentTarget.value)}
							ref={zoomSlider}
						/>
					</Show>
					<Show when={!settingHideExpo()}>
						<input
							class="slider sliderExpo"
							type="range"
							min={expoData().min}
							max={expoData().max}
							step={expoData().step}
							value={expo()}
							disabled={expo() == null}
							onInput={(e) => updateExpo(e.currentTarget.value)}
							ref={expoSlider}
						/>
					</Show>
					<IcoButton class="refresh" disabled={freeze()} handleClick={() => window.location.reload()} icon="refresh" />
					<IcoButton class="settings" disabled={freeze()} handleClick={() => setShowSettings(s => !s)} icon="settings" />
					<div class={`info ${infoActive() ? 'isActive' : ''}`} ref={infoEl}></div>
				</div>

				<div class="icoButtons">
					<IcoButton class="torch" active={torch()} disabled={torch() == null || freeze() || frontCamera()} handleClick={() => updateTorch(!torch())} icon={torch() ? 'bulbon' : 'bulb'} />
					<IcoButton class="selfie" active={frontCamera()} disabled={frontCamera() == null || freeze()} handleClick={() => toggleFrontCamera()} icon="selfie" />
					<IcoButton class="filter" active={filter() != "None"} handleClick={() => setShowFilters(true)} icon="filter" />
					<Show when={!freeze()}>
						<IcoButton class="multiplier" active={multiplied()} handleClick={() => setMultiplied(m => !m)} icon={multiplied() ? 'z2x' : 'z1x'} />
					</Show>
					<Show when={freeze()}>
						<IcoButton class="download" handleClick={() => downloadImage()} icon="download" />
					</Show>
					<IcoButton class="freeze" active={freeze()} handleClick={() => toggleFreeze()} icon={freeze() ? 'unfreeze' : 'freeze'} />
				</div>
			</div>

			<Preview filterClass={filterClass()} freeze={freeze()} multiplied={multiplied()} ref={previewEl} />

			<div class={`filters ${showFilters() ? 'isOpen' : ''}`}>
				<h3>Filter</h3>
				<button class="filterX" onClick={() => setShowFilters(false)}>✕</button>
				<div class="filtersGroup">
					<FilterButton name="None" filter={filter()} setFilter={setFilter} />
					<FilterButton name="Grayscale" filter={filter()} setFilter={setFilter} />
					<FilterButton name="Invert" filter={filter()} setFilter={setFilter} />
					<FilterButton name="Blacknwhite" filter={filter()} setFilter={setFilter} />
					<FilterButton name="Highcontrast" filter={filter()} setFilter={setFilter} />
					<FilterButton name="Lowercontrast" filter={filter()} setFilter={setFilter} />
					<FilterButton name="Highercontrast" filter={filter()} setFilter={setFilter} />
				</div>
			</div>

			<Wizard />

			<Show when={hasInstallPrompt()}>
				<button class="installApp" onClick={() => installApp()}>
					<Icon icon="download" />
					<span>Download App</span>
				</button>
				<Show when={showInstallPrompt()}>
					<div class="fixedEl installModal">
						<div class="installCont">
							<h3>Download App</h3>
							<p class="installText">Download Zoomin as app to your device?</p>
							<Button text="Download" handleClick={() => installApp()} />
							<Button text="Cancel" outline handleClick={() => setShowInstallPrompt(false)} />
						</div>
					</div>
				</Show>
			</Show>

			<div class={`fixedEl settingsModal ${showSettings() ? 'isOpen' : ''}`} >
				<div class="settingsModalClose" onClick={() => setShowSettings(false)}></div>
				<div class="settingsCont">
					<h3>Settings</h3>
					<button class="filterX" onClick={() => setShowSettings(false)}>✕</button>
					<div class="settingsOptions">
						<SettingLabel label="Hide zoom slider" checked={settingHideZoom()} handleChange={v => updateSettings(setSettingHideZoom(v))} />
						<SettingLabel label="Hide brightness slider" checked={settingHideExpo()} handleChange={v => updateSettings(setSettingHideExpo(v))} />
						<SettingLabel label="Disable gestures" checked={settingDIsableGestures()} handleChange={v => updateSettings(setSettingDisableGestures(v))} />
						<SettingLabel label="Smaller buttons" checked={settingSmallerButtons()} handleChange={v => updateSettings(setSettingSmallerButtons(v))} />
					</div>
					<Button text="Show wizard" handleClick={() => showWizard()} />
					<hr class="settingsDivider" />
					<Button text="Restore defaults" outline handleClick={() => restoreDefaults()} />
					<Button text="Full reload" handleClick={() => pageReload()} />
				</div>
			</div>
		</>
	)
}

export default App