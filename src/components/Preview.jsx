import { createSignal, createEffect } from "solid-js"

export default function createPreview() {
	let canvasEl
	// let iframeEl

	const [scale, setScale] = createSignal(1)
	const [posX, setPosX] = createSignal(0)
	const [posY, setPosY] = createSignal(0)
	const [transform, setTransform] = createSignal('none')

	let maxTransform = 0
	let scaleFactor = 1
	let moveMultiplier = 1
	let totalWidth
	let totalHeight

	let prevDiff = -1
	let pinchDiff = null
	let startX = -1
	let startY = -1

	function updateTransform() {
		let t = `scale(${scale()}) translate(-${posX() / totalWidth * maxTransform * 100}%, -${posY() / totalHeight * maxTransform * 100}%)`
		setTransform(t)
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startX = e.touches[0].clientX
			startY = e.touches[0].clientY
		}
	}

	function onTouchMove(e) {
		const touches = e.touches

		if (touches.length == 2) {
			let curDiff = Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY)

			if (prevDiff > 0) {
				if (pinchDiff == null) pinchDiff = curDiff

				let tempDiff = pinchDiff - curDiff
				if (Math.abs(tempDiff) > 1) {
					if (curDiff > prevDiff) setScale(s => Math.min(s + 0.03 * s, 10))
					else setScale(s => Math.max(s - 0.03 * s, 1))

					scaleFactor = 1 / scale()
					maxTransform = 1 - scaleFactor
					moveMultiplier = scaleFactor * 1.25

					pinchDiff = curDiff
					updateTransform()
				}
			}
			prevDiff = curDiff
		}
		if (startX > -1) {
			let diffX = startX - touches[0].clientX
			let diffY = startY - touches[0].clientY

			setPosX(x => Math.min(totalWidth, Math.max(x + diffX * moveMultiplier, 0)))
			setPosY(y => Math.min(totalHeight, Math.max(y + diffY * moveMultiplier, 0)))

			startX = touches[0].clientX
			startY = touches[0].clientY

			updateTransform()
		}
	}

	function onTouchEnd(e) {
		if (e.touches.length == 1) {
			prevDiff = -1
			pinchDiff = null
			startX = e.touches[0].clientX
			startY = e.touches[0].clientY
		} else if (e.touches.length == 0) {
			startX = -1
			startY = -1
		}
	}

	return {
		setPreview(video, zoom) {
			maxTransform = 0
			totalWidth = canvasEl.clientWidth
			totalHeight = canvasEl.clientHeight
			setPosX(totalWidth/2)
			setPosY(totalHeight/2)
			setScale(1)

			canvasEl.width = video.videoWidth
			canvasEl.height = video.videoHeight
			let ctx = canvasEl.getContext('2d')

			if (zoom) {
				ctx.scale(2, 2)
				ctx.drawImage(video, video.videoWidth / 4 * -1, video.videoHeight / 4 * -1)
			} else ctx.drawImage(video, 0, 0)

			updateTransform()
		},
		downloadImage() {
			let link = Object.assign(document.createElement('a'), {
				download: `zuum-${Date.now()}.webp`,
				href: canvasEl.toDataURL('image/webp')
			})
			link.click()
		},
		Preview(props) {
			return (
				<div class="fixedEl preview" classList={{isActive: props.freeze}}>
					<canvas
						class={`canvasEl ${props.filterClass}`}
						ref={canvasEl}
						onTouchStart={onTouchStart}
						onTouchMove={onTouchMove}
						onTouchEnd={onTouchEnd}
						onTouchCancel={onTouchEnd}
						style={{transform: transform()}}
					/>
					{/* <iframe class="iframeEl fixedEl" ref={iframeEl} frameborder="0" /> */}
				</div>
			)
		}
	}
}