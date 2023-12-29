import { createSignal, Switch, Match } from "solid-js"
import Icon from "./Icon"
import Button from "./Button"

export default function createWizard() {
	const [step, setStep] = createSignal(1)
	const [show, setShow] = createSignal(false)

	function skipWizard() {
		setShow(false)
		localStorage.setItem('wizardComplete', Date.now())
	}

	function getIconEl(icon, title) {
		return (
			<div class="wizardIconCont">
				<div class="wizardIcon">
					<Icon icon={icon} />
				</div>
				<span>{title}</span>
			</div>
		)
	}

	function getStepButtons(newStep) {
		return (
			<div class="wizardButtons">
				<Button text="Skip" outline handleClick={() => skipWizard()} />
				<Button text="Next" handleClick={() => setStep(newStep)} />
			</div>
		)
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
									<Icon icon="arrowsVertical" class="wizardStepArrows" />
									<Icon icon="hand" class="wizardStepHand" />
								</div>
								<p class="wizardStepText">Move vertically to increase/decrease zoom</p>
								{getStepButtons(2)}
							</div>
						</Match>
						<Match when={step() == 2}>
							<div class="wizardStep step2">
								<div class="wizardStepAnimation">
									<Icon icon="arrowsHorizontal" class="wizardStepArrows" />
									<Icon icon="hand" class="wizardStepHand" />
								</div>
								<p class="wizardStepText">Move horizontally to increase/decrease brightness</p>
								{getStepButtons(3)}
							</div>
						</Match>
						<Match when={step() == 3}>
							<div class="wizardStep step3">
								<div class="wizardStepAnimation">
									<Icon icon="arrowsHorizontal" class="wizardStepArrows" />
									<Icon icon="hand" class="wizardStepHand wizardStepHand1" />
									<Icon icon="hand" class="wizardStepHand wizardStepHand2" />
								</div>
								<p class="wizardStepText">Move two fingers to increase/decrease zoom</p>
								{getStepButtons(4)}
							</div>
						</Match>
						<Match when={step() == 4}>
							<div class="wizardStep step4">
								<p class="wizardIconsTitle">Buttons</p>
								<div class="wizardIcons">
									{getIconEl('freeze', 'Freeze image')}
									{getIconEl('z1x', 'Magnify')}
									{getIconEl('filter', 'Color filter')}
									{getIconEl('selfie', 'Front camera')}
									{getIconEl('bulb', 'Flashlight')}
								</div>
								<div class="wizardButtons">
									<Button text="OK" handleClick={() => skipWizard()} />
								</div>
							</div>
						</Match>
					</Switch>
				</div>
			)
		}
	}
}