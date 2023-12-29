export default function Button(props) {
	return <button class="button" classList={{outline: props.outline}} onClick={() => props.handleClick?.()}>{props.text}</button>
}