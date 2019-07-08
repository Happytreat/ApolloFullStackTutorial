import { Query, ApolloProvider } from 'react-apollo'
import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'

import Pages from './pages'
import Login from './pages/login'
import injectStyles from './styles'
import { resolvers, typeDefs } from './resolvers'

const cache = new InMemoryCache()
const link = new HttpLink({
	uri: 'http://localhost:4000/',
})

// instantiate client object
const client = new ApolloClient({
	cache,
	link: new HttpLink({
		uri: 'http://localhost:4000/graphql',
		headers: {
			authorization: localStorage.getItem('token'),
		},
		typeDefs,
		resolvers,
	}),
})

// Add default state to the Apollo cache
cache.writeData({
	data: {
		isLoggedIn: !!localStorage.getItem('token'),
		cartItems: [],
	},
})

// access local data with @client directive
const IS_LOGGED_IN = gql`
	query IsUserLoggedIn {
		isLoggedIn @client
	}
`

injectStyles()

/**
 * The ApolloProvider component wraps your React app and places the client on the context, which allows you to access it from anywhere in your component tree.
 */
ReactDOM.render(
	<ApolloProvider client={client}>
		<Query query={IS_LOGGED_IN}>{({ data }) => (data.isLoggedIn ? <Pages /> : <Login />)}</Query>
	</ApolloProvider>,
	document.getElementById('root')
)

// // Apollo tracks loading state and networkStatus of query automatically
// client
// 	.query({
// 		query: gql`
// 			query GetLaunch {
// 				launch(id: 56) {
// 					id
// 					mission {
// 						name
// 					}
// 				}
// 			}
// 		`,
// 	})
// 	.then(console.log)
