import React from 'react'
import { Markdown } from 'Components/utils/markdown'
import { useParams } from 'react-router'
import { flatRulesSelector } from 'Selectors/analyseSelectors'
import { useSelector } from 'react-redux'
import { findRuleByDottedName, decodeRuleName } from 'Engine/rules'

export default () => {
	const { encodedName } = useParams()
	const rules = useSelector(flatRulesSelector)
	const dottedName = decodeRuleName(encodedName)
	const rule = findRuleByDottedName(rules, dottedName)

	console.log(rule)
	if (!rule) return <div>OUPS</div>

	return (
		<div css="padding: 0 .3rem 1rem; max-width: 600px; margin: 1rem auto;">
			<div css="margin: 1.6rem 0">
				<Markdown
					source={rule.plus || "Cette fiche détaillée n'existe pas encore"}
				/>
			</div>
		</div>
	)
}