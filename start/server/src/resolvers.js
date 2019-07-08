const { paginateResults } = require('./utils')

// We recommend keeping your resolvers thin as a best practice.
// This allows you to safely refactor without worrying about breaking your API.

/*
Signature of a resolver:
fieldName: (parent, args, context, info) => data;
where:
- parent: An object that contains the result returned from the resolver on the parent type (e.g. when adding a virtual field to an existing type)
- args: An object that contains the arguments passed to the field
- context: An object shared by all resolvers in a GraphQL operation. We use the context to contain per-request state such as authentication information and access our data sources.  (Local resolvers always have the 'cache' added to the context automatically.)
- info: Information about the execution state of the operation which should only be used in advanced cases
*/

/**
 * The first argument to our top-level resolvers, parent,
 * is always blank because it refers to the root of our
 * graph.
 *  The second argument refers to any arguments passed into
 * our query,
 * We destructure our data sources from the third argument
 * context, in order to call them in our resolvers
 */
module.exports = {
	Query: {
		launches: async (_, { pageSize = 20, after }, { dataSources }) => {
			const allLaunches = await dataSources.launchAPI.getAllLaunches()
			// we want the launches in reverse chronological order (latest to oldest)
			allLaunches.reverse()
			const launches = paginateResults({
				after,
				pageSize,
				results: allLaunches,
			})

			// number of launches returned
			const noOfLaunches = launches.length
			return {
				launches,
				cursor: noOfLaunches ? launches[noOfLaunches - 1] : null,
				// if the cursor of the end of paginated result equals to
				// the last item in _all_ results, then there is no more results after this page
				hasMore: noOfLaunches
					? launches[noOfLaunches - 1].cursor !== allLaunches[allLaunches.length - 1].cursor
					: false,
			}
		},
		launch: (_, { id }, { dataSources }) => dataSources.launchAPI.getLaunchById({ launchId: id }),
		me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser(),
	},
	Mutation: {
		login: async (_, { email }, { dataSources }) => {
			const user = await dataSources.userAPI.findOrCreateUser({ email })
			// returns a token if a user exists
			if (user) return Buffer.from(email).toString('base64')
		},
		bookTrips: async (_, { launchIds }, { dataSources }) => {
			const results = await dataSources.userAPI.bookTrips({ launchIds })
			const launches = await dataSources.launchAPI.getLaunchesByIds({
				launchIds,
			})

			return {
				success: results && results.length === launchIds.length,
				message:
					results.length === launchIds.length
						? 'trips booked successfully'
						: `the following launches couldn't be booked: ${launchIds.filter(
								id => !results.includes(id)
						  )}`,
				launches,
			}
		},
		cancelTrip: async (_, { launchId }, { dataSources }) => {
			const result = await dataSources.userAPI.cancelTrip({ launchId })

			if (!result)
				return {
					success: false,
					message: 'failed to cancel trip',
				}

			const launch = await dataSources.launchAPI.getLaunchById({ launchId })
			return {
				success: true,
				message: 'trip cancelled',
				launches: [launch],
			}
		},
	},
	Mission: {
		// make sure the default size is 'large' in case user doesn't specify
		// first arg mission refers to parent
		missionPatch: (mission, { size } = { size: 'LARGE' }) => {
			return size === 'SMALL' ? mission.missionPatchSmall : mission.missionPatchLarge
		},
	},
	Launch: {
		isBooked: async (launch, _, { dataSources }) =>
			dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
	},
	User: {
		trips: async (_, __, { dataSources }) => {
			// get ids of launches by user
			const launchIds = await dataSources.userAPI.getLaunchIdsByUser()

			if (!launchIds.length) return []

			// look up those launches by their ids
			return (
				dataSources.launchAPI.getLaunchesByIds({
					launchIds,
				}) || []
			)
		},
	},
}
