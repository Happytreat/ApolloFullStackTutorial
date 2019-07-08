/**
 * Recommend managing local state in Apollo cache instead of say Redux
 * so that Apollo cache can be the single source of truth
 */
import gql from 'graphql-tag'
import { GET_CART_ITEMS } from './pages/cart'

// write a local schema for client by wrapping in gql and
// by extending the types of our server scheme
export const typeDefs = gql`
	extend type Query {
		isLoggedIn: Boolean!
		cartItems: [ID!]!
	}

	extend type Launch {
		isInCart: Boolean!
	}

	extend type Mutation {
		addOrRemoveFromCart(id: ID!): [Launch]
	}
`

export const resolvers = {
	Launch: {
		isInCart: (launch, _, { cache }) => {
			// Add a virtual field to the client-side data
			const { cartItems } = cache.readQuery({ query: GET_CART_ITEMS })
			return cartItems.includes(launch.id)
		},
	},
}
