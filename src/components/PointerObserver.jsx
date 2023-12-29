export default function PointerObserver(props) {
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
					if (curDiff > prevDiff) props.updateZoom(parseFloat(Math.min(parseFloat(props.zoom) + props.zoomData.step*1.5, props.zoomData.max)).toFixed(1))
					else props.updateZoom(parseFloat(Math.max(parseFloat(props.zoom) - props.zoomData.step*1.5, props.zoomData.min)).toFixed(1))

					pinchDiff = curDiff
				}
			}
			prevDiff = curDiff
		} else if (touches.length == 1) {
			if (lastX > -1) {
				let diffX = Math.abs(touches[0].clientX - lastX)
				if (diffX > props.expoMoveStep) {
					let multiplier = parseInt(diffX / props.expoMoveStep)

					if (touches[0].clientX > lastX) props.updateExpo(parseFloat(Math.min(parseFloat(props.expo) + (multiplier * props.expoData.step), props.expoData.max)).toFixed(1))
					else props.updateExpo(parseFloat(Math.max(parseFloat(props.expo) - (multiplier * props.expoData.step), props.expoData.min)).toFixed(1))

					lastX = touches[0].clientX
				}
			} else if (lastY > -1) {
				let diffY = Math.abs(touches[0].clientY - lastY)
				if (diffY > props.zoomMoveStep) {
					let multiplier = parseInt(diffY / props.zoomMoveStep)

					if (touches[0].clientY > lastY) props.updateZoom(parseFloat(Math.max(parseFloat(props.zoom) - (multiplier * props.zoomData.step), props.zoomData.min)).toFixed(1))
					else props.updateZoom(parseFloat(Math.min(parseFloat(props.zoom) + (multiplier * props.zoomData.step), props.zoomData.max)).toFixed(1))

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

	return (
		<div
			class="pointerObserver"
			onTouchStart={handleStart}
			onTouchMove={handleMove}
			onTouchEnd={handleCancel}
			onTouchCancel={handleCancel}
		/>
	)
}