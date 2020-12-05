import {
	goToQuestion,
	updateSituation,
	validateStepWithValue,
} from 'Actions/actions'
import RuleInput from 'Components/conversation/RuleInput'
import QuickLinks from 'Components/QuickLinks'
import * as Animate from 'Components/ui/animate'
import { EngineContext } from 'Components/utils/EngineContext'
import { useNextQuestions } from 'Components/utils/useNextQuestion'
import React, { useContext, useEffect } from 'react'
import emoji from 'react-easy-emoji'
import { Trans } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
	answeredQuestionsSelector,
	situationSelector,
} from 'Selectors/simulationSelectors'
import Aide from './Aide'
import './conversation.css'
import { ExplicableRule } from './Explicable'
import { createSelector } from 'reselect'

export type ConversationProps = {
	customEndMessages?: React.ReactNode
}

//TODO se rappeler ce que fait ce sélecteur et le convertir à publicodes
const orderedCurrentQuestionSelector = createSelector(
	[
		analysisWithDefaultsOnlySelector,
		nextStepsSelector,
		(state) => state.conversationSteps.unfoldedStep,
	],
	(analysis, nextSteps, unfoldedStep) => {
		const firstTargetFormula = analysis.targets[0].formule.explanation,
			isSum = firstTargetFormula.name === 'somme',
			currentQuestion = unfoldedStep || head(nextSteps)

		if (!isSum) return currentQuestion
		try {
			const items = firstTargetFormula.explanation
			const sortedSteps = sortBy(
				(question) =>
					-items.find((item) => question.indexOf(item.dottedName) === 0)
						?.nodeValue,
				nextSteps
			)
			return unfoldedStep || head(sortedSteps)
		} catch (e) {
			console.log(e)
			return currentQuestion
		}
	}
)

export default function Conversation({ customEndMessages }: ConversationProps) {
	const dispatch = useDispatch()
	const rules = useContext(EngineContext).getParsedRules()
	const currentQuestion = useNextQuestions()[0]
	const situation = useSelector(situationSelector)
	const currentQuestionIsAnswered = situation[currentQuestion] != null
	const previousAnswers = useSelector(answeredQuestionsSelector)
	useEffect(() => {
		if (currentQuestion) {
			dispatch(goToQuestion(currentQuestion))
		}
	}, [dispatch, currentQuestion])
	const setDefault = () =>
		dispatch(
			validateStepWithValue(
				currentQuestion,
				rules[currentQuestion]['par défaut']
			)
		)
	const goToPrevious = () =>
		dispatch(goToQuestion(previousAnswers.slice(-1)[0]))

	const submit = (source: string) => {
		dispatch({
			type: 'STEP_ACTION',
			name: 'fold',
			step: currentQuestion,
			source,
		})
	}

	const onChange = (value) => {
		dispatch(updateSituation(currentQuestion, value))
	}

	const handleKeyDown = ({ key }: React.KeyboardEvent) => {
		if (key === 'Escape') {
			setDefault()
		} else if (key === 'Enter') {
			submit('enter')
		}
	}

	return currentQuestion ? (
		<>
			<Aide />
			<div style={{ outline: 'none' }} onKeyDown={handleKeyDown}>
				<Animate.fadeIn>
					<div className="step">
						<h3>
							{rules[currentQuestion].question}{' '}
							<ExplicableRule dottedName={currentQuestion} />
						</h3>

						<fieldset>
							<RuleInput
								dottedName={currentQuestion}
								value={situation[currentQuestion]}
								onChange={onChange}
								onSubmit={submit}
								rules={rules}
							/>
						</fieldset>
					</div>
				</Animate.fadeIn>
				<div className="ui__ answer-group">
					{previousAnswers.length > 0 && (
						<>
							<button
								onClick={goToPrevious}
								className="ui__ simple small push-left button"
							>
								← <Trans>Précédent</Trans>
							</button>
						</>
					)}
					{currentQuestionIsAnswered ? (
						<button
							className="ui__ plain small button"
							onClick={() => submit('accept')}
						>
							<span className="text">
								<Trans>Suivant</Trans> →
							</span>
						</button>
					) : (
						<button
							onClick={setDefault}
							className="ui__ simple small push-right button"
						>
							<Trans>Passer</Trans> →
						</button>
					)}
				</div>
			</div>
			<QuickLinks />
		</>
	) : (
		<div style={{ textAlign: 'center' }}>
			<h3>
				{emoji('🌟')}{' '}
				<Trans i18nKey="simulation-end.title">
					Vous avez complété cette simulation
				</Trans>
			</h3>
			<p>
				{customEndMessages ? (
					customEndMessages
				) : (
					<Trans i18nKey="simulation-end.text">
						Vous avez maintenant accès à l'estimation la plus précise possible.
					</Trans>
				)}
			</p>
		</div>
	)
}
