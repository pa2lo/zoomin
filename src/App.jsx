import { createSignal, onMount, Show } from 'solid-js'
import Icon from './components/Icon'
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

	let zoomMoveStep = 1
	let expoMoveStep = 1

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
	function setStream(stream, setRearCameraId) {
		videoEl.srcObject = stream
		videoEl.play()

		const [track] = stream.getVideoTracks()
		const capabilities = track.getCapabilities()
		const settings = track.getSettings()

		videoStream = stream
		videoStreamTrack = track

		// console.log({capabilities, settings})
		currentCameraId = capabilities.deviceId
		if (setRearCameraId) rearCameraId = capabilities.deviceId

		videoStreamTrack.applyConstraints({
			advanced: [
				{
					width: Math.min(capabilities.width.max, 2200),
					resizeMode: "crop-and-scale"
				}
			]
		})

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

		if (setRearCameraId && !torchCameraId && capabilities.torch) {
			setTorch(false)
			torchCameraId = capabilities.deviceId
		}

		setMoveSteps()
	}
	function setMoveSteps() {
		if (zoom() != null)	zoomMoveStep = zoomSlider.clientWidth / ((zoomData().max - zoomData().min) / zoomData().step)
		if (expo() != null) expoMoveStep = expoSlider.clientWidth / ((expoData().max - expoData().min) / expoData().step)
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
		if (!videoStreamTrack) return

		setZoom(value)
		videoStreamTrack.applyConstraints({advanced: [ {zoom: value} ]})
		showInfo(`${parseFloat(value).toFixed(1)}X`)
	}

	// expo
	function updateExpo(value) {
		if (!videoStreamTrack) return

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

	// touch events
	let prevDiff = -1
	let pinchDiff = null
	let startX = -1
	let startY = -1
	let lastX = -1
	let lastY = -1

	function handleStart(e) {
		if (e.touches.length == 1) {
			startX = e.touches[0].clientX
			startY = e.touches[0].clientY
		}
	}
	function handleMove(e) {
		const touches = e.touches

		if (touches.length == 2) {
			let curDiff = Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY)

			if (prevDiff > 0) {
				if (pinchDiff == null) pinchDiff = curDiff

				let tempDiff = pinchDiff - curDiff
				if (Math.abs(tempDiff) > 2) {
					if (curDiff > prevDiff) updateZoom(parseFloat(Math.min(parseFloat(zoom()) + zoomData().step*1.5, zoomData().max)).toFixed(1))
					else updateZoom(parseFloat(Math.max(parseFloat(zoom()) - zoomData().step*1.5, zoomData().min)).toFixed(1))

					pinchDiff = curDiff
				}
			}
			prevDiff = curDiff
		} else if (touches.length == 1) {
			if (lastX > -1) {
				let diffX = Math.abs(touches[0].clientX - lastX)
				if (diffX > expoMoveStep) {
					let multiplier = parseInt(diffX / expoMoveStep)
					if (touches[0].clientX > lastX) updateExpo(parseFloat(Math.min(parseFloat(expo()) + (multiplier * expoData().step), expoData().max)).toFixed(1))
					else updateExpo(parseFloat(Math.max(parseFloat(expo()) - (multiplier * expoData().step), expoData().min)).toFixed(1))

					lastX = touches[0].clientX
				}
			} else if (lastY > -1) {
				let diffY = Math.abs(touches[0].clientY - lastY)
				if (diffY > zoomMoveStep) {
					let multiplier = parseInt(diffY / zoomMoveStep)
					if (touches[0].clientY > lastY) updateZoom(parseFloat(Math.max(parseFloat(zoom()) - (multiplier * zoomData().step), zoomData().min)).toFixed(1))
					else updateZoom(parseFloat(Math.min(parseFloat(zoom()) + (multiplier * zoomData().step), zoomData().max)).toFixed(1))

					lastY = touches[0].clientY
				}
			} else {
				let diffX = touches[0].clientX - startX,
					diffY = touches[0].clientY - startY,
					absDiffY = Math.abs(diffY),
					absDiffX = Math.abs(diffX)

				if (absDiffX > absDiffY && absDiffX > 8) lastX = touches[0].clientX
				else if (absDiffY > absDiffX && absDiffY > 8) lastY = touches[0].clientY
			}
		}
	}
	function handleCancel(e) {
		if (e.touches.length == 1) {
			prevDiff = -1
			pinchDiff = null
			startX = e.touches[0].clientX
			startY = e.touches[0].clientY
		} else {
			startX = -1
			startY = -1
		}
		lastX = -1
		lastY = -1
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

	function getDefaultCamera() {
		navigator.mediaDevices.getUserMedia({
			video: { facingMode: "environment" }
		}).then(stream => {
			setStream(stream, true)
		}).catch(error => console.log(error))
	}

	// mount
	onMount(() => {
		getDefaultCamera()

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === "visible") {
				getDefaultCamera()
			} else {
				if (videoStreamTrack) videoStreamTrack.stop()
			}
		})

		navigator.mediaDevices.enumerateDevices().then((devices) => {
			devices.filter(device => device.kind == 'videoinput').forEach(async device => {
				if (torchCameraId && frontCameraId) return

				const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: device.deviceId } })
				const [track] = stream.getVideoTracks()
				const capabilities = track.getCapabilities()
				track.stop()

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
						<div
							class="pointerObserver"
							onTouchStart={handleStart}
							onTouchMove={handleMove}
							onTouchEnd={handleCancel}
							onTouchCancel={handleCancel}
						/>
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
					<button class="icoButton refresh" disabled={freeze()} onClick={() => window.location.reload()}>
						<Icon icon="refresh" />
					</button>
					<button class="icoButton settings" disabled={freeze()} onClick={() => setShowSettings(s => !s)}>
						<Icon icon="settings" />
					</button>
					<div class={`info ${infoActive() ? 'isActive' : ''}`} ref={infoEl}></div>
				</div>

				<div class="icoButtons">
					<button class="icoButton torch" classList={{isActive: torch()}} disabled={torch() == null || freeze() || frontCamera()} onClick={() => updateTorch(!torch())}>
						<Icon icon={torch() ? 'bulbon' : 'bulb'} />
					</button>
					<button class="icoButton selfie" classList={{isActive: frontCamera()}} disabled={frontCamera() == null || freeze()} onClick={() => toggleFrontCamera()}>
						<Icon icon="selfie" />
					</button>
					<button class="icoButton filter" classList={{isActive: filter() != "None"}} onClick={() => setShowFilters(true)}>
						<Icon icon="filter" />
					</button>
					<Show when={!freeze()}>
						<button class="icoButton multiplier" classList={{isActive: multiplied()}} onClick={() => setMultiplied(m => !m)}>
							<Icon icon={multiplied() ? 'z2x' : 'z1x'} />
						</button>
					</Show>
					<Show when={freeze()}>
						<button class="icoButton download" onClick={() => downloadImage()}>
							<Icon icon="download" />
						</button>
					</Show>
					<button class="icoButton freeze" classList={{isActive: freeze()}} onClick={() => toggleFreeze()}>
						<Icon icon={freeze() ? 'unfreeze' : 'freeze'}/>
					</button>
				</div>
			</div>

			<Preview filterClass={filterClass()} freeze={freeze()} multiplied={multiplied()} ref={previewEl} />

			<div class={`filters ${showFilters() ? 'isOpen' : ''}`}>
				<h3>Filter</h3>
				<button class="filterX" onClick={() => setShowFilters(false)}>✕</button>
				<div class="filtersGroup">
					<button class="filterButton" onClick={() => setFilter('None')} classList={{isActive: filter() == 'None'}}>
						<img class="filterImg filterNone" src="/book-crop.jpg" alt='' />
					</button>
					<button class="filterButton" onClick={() => setFilter('Grayscale')} classList={{isActive: filter() == 'Grayscale'}}>
						<img class="filterImg filterGrayscale" src="/book-crop.jpg" alt='' />
					</button>
					<button class="filterButton" onClick={() => setFilter('Invert')} classList={{isActive: filter() == 'Invert'}}>
						<img class="filterImg filterInvert" src="/book-crop.jpg" alt='' />
					</button>
					<button class="filterButton" onClick={() => setFilter('Blacknwhite')} classList={{isActive: filter() == 'Blacknwhite'}}>
						<img class="filterImg filterBlacknwhite" src="/book-crop.jpg" alt='' />
					</button>
					<button class="filterButton" onClick={() => setFilter('Highcontrast')} classList={{isActive: filter() == 'Highcontrast'}}>
						<img class="filterImg filterHighcontrast" src="/book-crop.jpg" alt='' />
					</button>
					<button class="filterButton" onClick={() => setFilter('Lowercontrast')} classList={{isActive: filter() == 'Lowercontrast'}}>
						<img class="filterImg filterLowercontrast" src="/book-crop.jpg" alt='' />
					</button>
					<button class="filterButton" onClick={() => setFilter('Highercontrast')} classList={{isActive: filter() == 'Highercontrast'}}>
						<img class="filterImg filterHighercontrast" src="/book-crop.jpg" alt='' />
					</button>
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
							<button class="button" onClick={() => installApp()}>Download</button>
							<button class="button outline" onClick={() => setShowInstallPrompt(false)}>Cancel</button>
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
						<label class="settingLabel">
							<span class="settingText">Hide zoom slider</span>
							<input class="settingCb" type="checkbox" checked={settingHideZoom()} onChange={(e) => updateSettings(setSettingHideZoom(e.target.checked))} />
						</label>
						<label class="settingLabel">
							<span class="settingText">Hide brightness slider</span>
							<input class="settingCb" type="checkbox" checked={settingHideExpo()} onChange={(e) => updateSettings(setSettingHideExpo(e.target.checked))} />
						</label>
						<label class="settingLabel">
							<span class="settingText">Disable gestures</span>
							<input class="settingCb" type="checkbox" checked={settingDIsableGestures()} onChange={(e) => updateSettings(setSettingDisableGestures(e.target.checked))} />
						</label>
						<label class="settingLabel">
							<span class="settingText">Smaller buttons</span>
							<input class="settingCb" type="checkbox" checked={settingSmallerButtons()} onChange={(e) => updateSettings(setSettingSmallerButtons(e.target.checked))} />
						</label>
					</div>
					<button class="button" onClick={() => showWizard()}>Show wizard</button>
					<hr class="settingsDivider" />
					<button class="button outline" onClick={() => restoreDefaults()}>Restore defaults</button>
					<button class="button" onClick={() => pageReload()}>Full reload</button>
				</div>
			</div>
		</>
	)
}

export default App