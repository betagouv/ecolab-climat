import React from 'react'
import { getCategories, computeEmpreinteMaximum } from './index'
import { useSelector } from 'react-redux'
import {
	analysisWithDefaultsSelector,
	parsedRulesSelector,
} from 'Selectors/analyseSelectors'
import { Link } from 'react-router-dom'
import { getRuleFromAnalysis, encodeRuleName } from 'Engine/rules'
import Bar from './Bar'
import emoji from 'react-easy-emoji'

const sustainableLifeGoal = 2000 // kgCO2e
const barWidth = '6rem'

export default ({ details, color, noText, value }) => {
	const analysis = useSelector(analysisWithDefaultsSelector),
		rules = useSelector(parsedRulesSelector)

	const categories = getCategories(analysis, details, rules)

	if (!categories) return null

	const empreinteMaximum = computeEmpreinteMaximum(categories)
	const empreinteTotale = categories.reduce(
		(memo, next) => next.nodeValue + memo,
		0
	)
	return (
		<section
			css={`
				h2 {
					margin: 0.6rem 0 0.1rem;
					font-size: 140%;
				}
				strong {
					font-weight: 600;
				}
				padding: 0;
			`}
		>
			<div
				css={`
					position: relative;
					display: flex;
					justify-content: space-evenly;
					align-items: flex-end;
					height: 40vh;
				`}
			>
				<div css="height: 100%">
					<div css="line-height: 1.2rem">
						<strong>
							{Math.round(value / 1000)} <br />
						</strong>
						tonnes
					</div>
					<ul
						css={`
							margin: 0;
							width: ${barWidth};
							height: calc(100% - 2.4rem);
							border-radius: 0.3rem;
							border: 3px solid ${color};
							padding: 0;
						`}
					>
						{categories.map((category) => (
							<li
								key={category.title}
								css={`
									margin: 0;
									list-style-type: none;
									> a {
										display: block;
										text-decoration: none;
										line-height: inherit;
									}
									background: ${category.couleur};
									height: ${(category.nodeValue / empreinteTotale) * 100}%;
									display: flex;
									align-items: center;
									justify-content: center;
								`}
							>
								<Link
									to={'/documentation/' + encodeRuleName(category.dottedName)}
								>
									<div
										css={`
											height: 100%;
											img {
												font-size: 120%;
											}
										`}
									>
										{category.nodeValue / empreinteTotale > 0.1
											? emoji(category.icons)
											: ''}
									</div>
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div css="display: flex; justify-content: center; flex-wrap: wrap; max-width: 10rem">
					<div
						css={`
							border-radius: 0.3rem;
							border: 3px solid ${color};
							background: #78e08f;
							height: ${(sustainableLifeGoal / empreinteTotale) * 100}%;
							width: ${barWidth};
						`}
					>
						<strong>{sustainableLifeGoal / 1000}</strong>
						<br />
						tonnes
					</div>
				</div>
			</div>
			<div
				css={`
					display: flex;
					justify-content: space-between;
					margin-top: 1rem;
				`}
			>
				<div
					css={`
						background: #ffffff3d;
						border-radius: 0.6rem;
						margin: 0 0.6rem;
						padding: 0.4rem 1rem;
					`}
				>
					{emoji('☝️')} Votre empreinte climat
				</div>
				<div
					css={`
						background: #ffffff3d;

						border-radius: 0.6rem;
						margin: 0 0.6rem;
						padding: 0.4rem 1rem;
					`}
				>
					<div>{emoji('🎯')} L'objectif pour être écolo.</div>
					<div>
						<a
							css="color: inherit"
							href="https://ecolab.ademe.fr/blog/général/budget-empreinte-carbone-c-est-quoi.md"
						>
							Comment ça ?
						</a>
					</div>
				</div>
			</div>
		</section>
	)
}
