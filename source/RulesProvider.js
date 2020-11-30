import React from 'react'
import { connect } from 'react-redux'

export default connect(
	(state) => ({ rulesLoaded: state.rules != null }),
	(dispatch) => ({
		setRules: (rules) => dispatch({ type: 'SET_RULES', rules }),
	})
)(
	class extends React.Component {
		removeLoader() {
			// Remove loader
			var css = document.createElement('style')
			css.type = 'text/css'
			css.innerHTML = `
#js {
        animation: appear 0.5s;
        opacity: 1;
}
#loading {
        display: none !important;
}`
			document.body.appendChild(css)
		}
		constructor(props) {
			super(props)

			if (process.env.NODE_ENV === 'development' && !props.dataBranch) {
				// Rules are stored in nested yaml files
				const req = require.context(
					'../../ecolab-data/data/',
					true,
					/\.(yaml)$/
				)

				// Bigger rule explanations are stored in nested .md files
				const reqPlus = require.context(
					'raw-loader!../../ecolab-data/data/actions/plus/',
					true,
					/\.(md)$/
				)

				const plusDottedNames = Object.fromEntries(
					reqPlus
						.keys()
						.map((path) => [
							path.replace(/(\.\/|\.md)/g, ''),
							reqPlus(path).default,
						])
				)

				const rules = req.keys().reduce((memo, key) => {
					const jsonRuleSet = req(key) || {}
					const ruleSetPlus = Object.fromEntries(
						Object.entries(jsonRuleSet).map(([k, v]) =>
							plusDottedNames[k]
								? [k, { ...v, plus: plusDottedNames[k] }]
								: [k, v]
						)
					)
					return { ...memo, ...ruleSetPlus }
				}, {})
				console.log('YOYO', rules['transport . éco-conduite'])
				this.props.setRules(rules)
				this.removeLoader()
			} else {
				fetch(props.rulesURL, { mode: 'cors' })
					.then((response) => response.json())
					.then((json) => {
						this.props.setRules(json)
						this.removeLoader()
					})
			}
		}
		render() {
			if (!this.props.rulesLoaded) return null
			return this.props.children
		}
	}
)
