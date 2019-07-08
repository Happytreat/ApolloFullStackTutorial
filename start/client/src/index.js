import { ApolloProvider } from 'react-apollo'
import React from 'react'
import ReactDOM from 'react-dom'
import Pages from './pages'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
// import gql from 'graphql-tag'

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
	}),
})

cache.writeData({
	data: {
		isLoggedIn: !!localStorage.getItem('token'),
		cartItems: [],
	},
})

/**
 * The ApolloProvider component wraps your React app and places the client on the context, which allows you to access it from anywhere in your component tree.
 */
ReactDOM.render(
	<ApolloProvider client={client}>
		<Pages />
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
