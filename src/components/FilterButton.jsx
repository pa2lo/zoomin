export default function FilterButton(props) {
	return (
		<button class="filterButton" onClick={() => props.setFilter?.(props.name)} classList={{isActive: props.name == props.filter}}>
			<img class={`filterImg filter${props.name}`} src="/book-crop.jpg" alt='' />
		</button>
	)
}