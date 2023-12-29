import Icon from "./Icon"

export default function IcoButton(props) {
	return (
		<button class={`icoButton ${props.class} ${props.active ? 'isActive' : ''}`} disabled={props.disabled} onClick={() => props.handleClick?.()}>
			<Icon icon={props.icon} />
		</button>
	)
}