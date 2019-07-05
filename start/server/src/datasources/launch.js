const { RESTDataSource } = require('apollo-datasource-rest')

/**
Apollo makes connecting these services to your graph simple with our data source API. An Apollo data source is a class that encapsulates all of the data fetching logic, as well as caching and deduplication, for a particular service. By using Apollo data sources to hook up your services to your graph API, you're also following best practices for organizing your code.
 */

class LaunchAPI extends RESTDataSource {
	constructor() {
		super()
		this.baseURL = 'https://api.spacexdata.com/v2/'
	}

	/**
	 * The Apollo REST data sources have helper methods that correspond to HTTP
	 * verbs like GET and POST.
	 */
	async getAllLaunches() {
		// makes a GET request to  https://api.spacexdata.com/v2/launches
		const response = await this.get('launches')
		return Array.isArray(response) ? response.map(launch => this.launchReducer(launch)) : []
	}

	/**
	 * launchReducer to transform fetched launch data from API into the shape
	 * schema expects
	 */
	launchReducer(launch) {
		return {
			id: launch.flight_number || 0,
			cursor: `${launch.launch_date_unix}`,
			site: launch.launch_site && launch.launch_site.site_name,
			mission: {
				name: launch.mission_name,
				missionPatchSmall: launch.links.mission_patch_small,
				missionPatchLarge: launch.links.mission_patch,
			},
			rocket: {
				id: launch.rocket.rocket_id,
				name: launch.rocket.rocket_name,
				type: launch.rocket.rocket_type,
			},
		}
	}

	async getLaunchById({ launchId }) {
		const response = await this.get('launches', { flight_number: launchId })
		return this.launchReducer(response[0])
	}

	getLaunchesByIds({ launchIds }) {
		return Promise.all(launchIds.map(launchId => this.getLaunchById({ launchId })))
	}
}

module.exports = LaunchAPI
