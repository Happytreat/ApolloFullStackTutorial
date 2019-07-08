import React, { Fragment } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { LaunchTile, Header, Button, Loading } from '../components'

// Use a fragment to share fields between the two GraphQL
// operations from launches.js and launch.js
// name of fragment LaunchTile can be any
// but the type must correspond to a type in schema
export const LAUNCH_TILE_DATA = gql`
	fragment LaunchTile on Launch {
		id
		isBooked
		rocket {
			id
			name
		}
		mission {
			name
			missionPatch
		}
	}
`

// import LAUNCH_TILE_DATA into gql document
const GET_LAUNCHES = gql`
	query launchList($after: String) {
		launches(after: $after) {
			cursor
			hasMore
			launches {
				...LaunchTile
			}
		}
	}
	${LAUNCH_TILE_DATA}
`

// define a render prop function as the child of Query and
// given state of query(loading, error, data)
export default function Launches() {
	return (
		<Query query={GET_LAUNCHES}>
			{({ data, loading, error, fetchMore }) => {
				if (loading) return <Loading />
				if (error) return <p>ERROR</p>

				return (
					<Fragment>
						<Header />
						{data.launches &&
							data.launches.launches &&
							data.launches.launches.map(launch => <LaunchTile key={launch.id} launch={launch} />)}
						{// First check to see if we have more launches available in our query.
						// If we do, we render a button with a click handler that calls the fetchMore function from Apollo

						// define the updateQuery function to tell Apollo
						// how to update the list of launches in the cache.
						data.launches && data.launches.hasMore && (
							<Button
								onClick={() =>
									fetchMore({
										variables: {
											after: data.launches.cursor,
										},

										updateQuery: (prev, { fetchMoreResult, ...rest }) => {
											if (!fetchMoreResult) return prev
											return {
												...fetchMoreResult,
												launches: {
													...fetchMoreResult.launches,
													launches: [
														...prev.launches.launches,
														...fetchMoreResult.launches.launches,
													],
												},
											}
										},
									})
								}
							>
								Load More
							</Button>
						)}
					</Fragment>
				)
			}}
		</Query>
	)
}
