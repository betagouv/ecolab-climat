import { formatValue, Evaluation, Unit } from 'publicodes'
const { serializeUnit } = require('publicodes')
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import NumberFormat from 'react-number-format'
import { currencyFormat, debounce } from '../../utils'
import InputSuggestions from './InputSuggestions'
import InputEstimation from './InputEstimation'
import { InputCommonProps } from './RuleInput'

// TODO: fusionner Input.js et CurrencyInput.js
export default function Input({
	suggestions,
	onChange,
	onSubmit,
	id,
	value,
	missing,
	unit,
	autoFocus,
	inputEstimation,
}: InputCommonProps & {
	onSubmit: (source: string) => void
	unit: Unit | undefined
	value: Evaluation<number>
	inputEstimation: Object | void
}) {
	const debouncedOnChange = useCallback(debounce(550, onChange), [])
	const { language } = useTranslation().i18n
	const unité = serializeUnit(unit)
	const { thousandSeparator, decimalSeparator } = currencyFormat(language)

	return (
		<>
			<div className="step input">
				<div>
					<InputSuggestions
						suggestions={suggestions}
						onFirstClick={(value) => {
							onChange(value)
						}}
						onSecondClick={() => onSubmit?.('suggestion')}
					/>
					<NumberFormat
						autoFocus={autoFocus}
						className="suffixed ui__"
						id={id}
						thousandSeparator={thousandSeparator}
						decimalSeparator={decimalSeparator}
						allowEmptyFormatting={true}
						// We don't want to call `onValueChange` in case this component is
						// re-render with a new "value" prop from the outside.
						onValueChange={({ floatValue }) => {
							debouncedOnChange(
								floatValue != undefined ? { valeur: floatValue, unité } : {}
							)
						}}
						autoComplete="off"
						{...{ [missing ? 'placeholder' : 'value']: value ?? '' }}
					/>
					<span className="suffix">&nbsp;{unité}</span>
				</div>
			</div>
			<div css="width: 100%">
				{inputEstimation && (
					<InputEstimation
						inputEstimation={inputEstimation}
						setFinalValue={(value) => {
							onChange(value)
						}}
					/>
				)}
			</div>
		</>
	)
}
