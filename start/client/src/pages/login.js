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
		<Mutation mutation={LOGIN_USER}>{(login, { data }) => <LoginForm login={login} />}</Mutation>
	)
}
