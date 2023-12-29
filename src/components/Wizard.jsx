import { createSignal, Switch, Match } from "solid-js"

export default function createWizard() {
	const [step, setStep] = createSignal(1)
	const [show, setShow] = createSignal(false)

	function skipWizard() {
		setShow(false)
		localStorage.setItem('wizardComplete', Date.now())
	}

	return {
		runWizard() {
			setStep(1)
			setShow(true)
		},

		Wizard() {
			return (
				<div class={`fixedEl wizard ${show() ? 'isOpen' : ''}`}>
					<Switch>
						<Match when={step() == 1}>
							<div class="wizardStep step1">
								<div class="wizardStepAnimation">
									<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrows-vertical wizardStepArrows" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l4 -4l4 4" /><path d="M8 17l4 4l4 -4" /><path d="M12 3l0 18" /></svg>
									<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-hand-finger wizardStepHand" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" /><path d="M11 11.5v-2a1.5 1.5 0 1 1 3 0v2.5" /><path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" /><path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" /></svg>
								</div>
								<p class="wizardStepText">Move vertically to increase/decrease zoom</p>
								<div class="wizardButtons">
									<button class="button outline" onClick={() => skipWizard()} >Skip</button>
									<button class="button" onClick={() => setStep(2)} >Next</button>
								</div>
							</div>
						</Match>
						<Match when={step() == 2}>
							<div class="wizardStep step2">
								<div class="wizardStepAnimation">
									<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrows-horizontal wizardStepArrows" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8l-4 4l4 4" /><path d="M17 8l4 4l-4 4" /><path d="M3 12l18 0" /></svg>
									<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-hand-finger wizardStepHand" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" /><path d="M11 11.5v-2a1.5 1.5 0 1 1 3 0v2.5" /><path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" /><path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" /></svg>
								</div>
								<p class="wizardStepText">Move horizontally to increase/decrease brightness</p>
								<div class="wizardButtons">
									<button class="button outline" onClick={() => skipWizard()} >Skip</button>
									<button class="button" onClick={() => setStep(3)} >Next</button>
								</div>
							</div>
						</Match>
						<Match when={step() == 3}>
							<div class="wizardStep step3">
								<div class="wizardStepAnimation">
									<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrows-horizontal wizardStepArrows" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8l-4 4l4 4" /><path d="M17 8l4 4l-4 4" /><path d="M3 12l18 0" /></svg>
									<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-hand-finger wizardStepHand wizardStepHand1" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" /><path d="M11 11.5v-2a1.5 1.5 0 1 1 3 0v2.5" /><path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" /><path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" /></svg>
									<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-hand-finger wizardStepHand wizardStepHand2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" /><path d="M11 11.5v-2a1.5 1.5 0 1 1 3 0v2.5" /><path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" /><path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" /></svg>
								</div>
								<p class="wizardStepText">Move two fingers to increase/decrease zoom</p>
								<div class="wizardButtons">
									<button class="button outline" onClick={() => skipWizard()} >Skip</button>
									<button class="button" onClick={() => setStep(4)} >Next</button>
								</div>
							</div>
						</Match>
						<Match when={step() == 4}>
							<div class="wizardStep step4">
								<p class="wizardIconsTitle">Buttons</p>
								<div class="wizardIcons">
									<div class="wizardIconCont">
										<div class="wizardIcon">
											<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-snowflake" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4l2 1l2 -1"></path><path d="M12 2v6.5l3 1.72"></path><path d="M17.928 6.268l.134 2.232l1.866 1.232"></path><path d="M20.66 7l-5.629 3.25l.01 3.458"></path><path d="M19.928 14.268l-1.866 1.232l-.134 2.232"></path><path d="M20.66 17l-5.629 -3.25l-2.99 1.738"></path><path d="M14 20l-2 -1l-2 1"></path><path d="M12 22v-6.5l-3 -1.72"></path><path d="M6.072 17.732l-.134 -2.232l-1.866 -1.232"></path><path d="M3.34 17l5.629 -3.25l-.01 -3.458"></path><path d="M4.072 9.732l1.866 -1.232l.134 -2.232"></path><path d="M3.34 7l5.629 3.25l2.99 -1.738"></path></svg>
										</div>
										<span>Freeze image</span>
									</div>
									<div class="wizardIconCont">
										<div class="wizardIcon">
											<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-multiplier-1x" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 16v-8l-2 2"></path><path d="M13 16l4 -8"></path><path d="M17 16l-4 -8"></path></svg>
										</div>
										<span>Magnify</span>
									</div>
									<div class="wizardIconCont">
										<div class="wizardIcon">
											<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-color-filter" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M13.58 13.79c.27 .68 .42 1.43 .42 2.21c0 1.77 -.77 3.37 -2 4.46a5.93 5.93 0 0 1 -4 1.54c-3.31 0 -6 -2.69 -6 -6c0 -2.76 1.88 -5.1 4.42 -5.79"></path><path d="M17.58 10.21c2.54 .69 4.42 3.03 4.42 5.79c0 3.31 -2.69 6 -6 6a5.93 5.93 0 0 1 -4 -1.54"></path><path d="M12 8m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"></path></svg>
										</div>
										<span>Color filter</span>
									</div>
									<div class="wizardIconCont">
										<div class="wizardIcon">
											<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-camera-selfie" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2"></path><path d="M9.5 15a3.5 3.5 0 0 0 5 0"></path><path d="M15 11l.01 0"></path><path d="M9 11l.01 0"></path></svg>
										</div>
										<span>Front camera</span>
									</div>
									<div class="wizardIconCont">
										<div class="wizardIcon">
											<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bulb" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7"></path><path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3"></path><path d="M9.7 17l4.6 0"></path></svg>
										</div>
										<span>Flashlight</span>
									</div>
								</div>
								<div class="wizardButtons">
									<button class="button" onClick={() => skipWizard()} >Ok</button>
								</div>
							</div>
						</Match>
					</Switch>
				</div>
			)
		}
	}
}