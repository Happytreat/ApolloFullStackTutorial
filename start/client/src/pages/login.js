import React from 'react'
import { Mutation, ApolloConsumer } from 'react-apollo'
import gql from 'graphql-tag'

import { LoginForm, Loading } from '../components'

const LOGIN_USER = gql`
	mutation login($email: String!) {
		login(email: $email)
	}
`

// first argument to the Mutation render props is: a mutate function that triggers the mutation
// second argument is the result object
export default function Login() {
	return (
		<ApolloConsumer>
			{client => (
				<Mutation
					mutation={LOGIN_USER}
					onCompleted={({ login }) => {
						localStorage.setItem('token', login)
						client.writeData({ data: { isLoggedIn: true } })
					}}
				>
					{(login, { loading, error }) => {
						// this loading state will probably never show, but it's helpful to
						// have for testing
						if (loading) return <Loading />
						if (error) return <p>An error occurred</p>

						return <LoginForm login={login} />
					}}
				</Mutation>
			)}
		</ApolloConsumer>
	)
}
