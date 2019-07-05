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
		launches: (_, __, { dataSources }) => dataSources.launchAPI.getAllLaunches(),
		launch: (_, { id }, { dataSources }) => dataSources.launchAPI.getLaunchById({ launchId: id }),
		me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser(),
	},
}
