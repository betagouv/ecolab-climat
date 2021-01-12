import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import {
	analysisWithDefaultsSelector,
	parsedRulesSelector,
} from 'Selectors/analyseSelectors'
import { getRuleFromAnalysis, encodeRuleName } from 'Engine/rules'
import Bar from './Bar'
import { sortBy } from 'ramda'
import { Link } from 'react-router-dom'

export const sortCategories = sortBy(({ nodeValue }) => -nodeValue)
export const extractCategories = (analysis) => {
	const getRule = getRuleFromAnalysis(analysis)

	const bilan = getRule('bilan')
	if (!bilan) return null
	const categories = bilan.formule.explanation.explanation.map(
		(category) => category.explanation
	)

	return sortCategories(categories)
}

export const getCategories = (analysis, details, rules) =>
	analysis?.targets.length
		? extractCategories(analysis)
		: details &&
		  sortCategories(
				rules['bilan'].formule.explanation.explanation.map((reference) => {
					const category = rules[reference.dottedName]
					return {
						...category,
						nodeValue: details[category.name[0]],
					}
				})
		  )

export const computeEmpreinteMaximum = (categories) =>
	categories.reduce(
		(memo, next) => (memo.nodeValue > next.nodeValue ? memo : next),
		-1
	).nodeValue

export default ({ details, color, noText, noAnimation }) => {
	const analysis = useSelector(analysisWithDefaultsSelector),
		rules = useSelector(parsedRulesSelector)

	const categories = getCategories(analysis, details, rules)

	if (!categories) return null

	const empreinteMaximum = computeEmpreinteMaximum(categories)
	return (
		<section
			css={`
				padding: 0;
			`}
		>
			<div
				css={`
					position: relative;
				`}
			>
				<ul
					css={`
						margin-left: 2rem;

						@media (min-width: 800px) {
							max-width: 35rem;
						}
					`}
				>
					{categories.map((category) => (
						<motion.li
							layoutTransition={
								noAnimation
									? null
									: {
											type: 'spring',
											damping: 100,
											stiffness: 100,
									  }
							}
							key={category.title}
							css={`
								margin: 0.4rem 0;
								list-style-type: none;
								> a {
									display: block;
									text-decoration: none;
									line-height: inherit;
								}
							`}
						>
							<Link
								to={'/documentation/' + encodeRuleName(category.dottedName)}
							>
								<Bar {...{ ...category, color, noText, empreinteMaximum }} />
							</Link>
						</motion.li>
					))}
				</ul>
			</div>
		</section>
	)
}
