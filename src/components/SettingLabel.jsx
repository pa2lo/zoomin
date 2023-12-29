export default function SettingLabel(props) {
	return (
		<label class="settingLabel">
			<span class="settingText">{props.label}</span>
			<input class="settingCb" type="checkbox" checked={props.checked} onChange={(e) => props.handleChange?.(e.target.checked)} />
		</label>
	)
}