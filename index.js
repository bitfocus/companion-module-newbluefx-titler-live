const instance_skel = require('../../instance_skel')
const QWebChannel = require('qwebchannel').QWebChannel
const WebSocket = require('ws')
let debug = () => {}
let scheduler

class instance extends instance_skel {
	/**
	 * Create an instance of the module
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config)
		this.titlesPlayStatus = []
		this.initWebSocket()
		this.setupFeedbacks()
		this.actions() // export actions
	}

	init() {
		this.status(this.STATE_WARNING, "no connection")
		this.CHOICES_TITLES = [{ id: 0, label: 'no titles loaded yet', play: 'Done' }]
		this.on_air_status = []
		debug = this.debug
		log = this.log
	}
	updateConfig(config) {
		debug('config updated')
		this.config = config
		this.initWebSocket()
	}

	initWebSocket() {
		let ip = this.config.host
		let port = this.config.port
		if (!ip || !port) {
			return this
		}

		let socket = new WebSocket(`ws://${ip}:${port}`)

		socket.on('open', () => {
			// Establish API connection.
			new QWebChannel(socket, (channel) => {
				scheduler = channel.objects.scheduler
				this.status(this.STATE_OK) // status ok!
			})

			setTimeout(() => {
				scheduler.scheduleCommand('getTitleControlInfo', {}, {}, (reply) => {
					// Parse titleInfo and extract for now only the information we need
					this.CHOICES_TITLES.length = 0
					for (const [key, value] of Object.entries(JSON.parse(reply))) {
						if (key == 'titles') {
							value.forEach((element) => {
								this.CHOICES_TITLES.push({ id: element.id, label: element.name, play: element.status })
								this.titlesPlayStatus[element.id] = element.status
							})
						}
					}
					this.actions()
					this.setupFeedbacks()
					this.checkFeedbacks('on_air_status')
				})
				scheduler.scheduleCommand('subscribe', { channel: '-1', id: 'all', events: 'play' }, {})
				// Once subscriptions are enabled, listen for onNotify callbacks.
				scheduler.onNotify.connect((notification) => {
					// Convert the payload string into a JSON object.
					let jsonReply = JSON.parse(notification)
					// And then use the object to inform the state...
					this.titlesPlayStatus[jsonReply.id]=jsonReply.play
					this.checkFeedbacks('on_air_status')
				})
			}, 1500) // need to make the qtwebchannel a promise
		})

		socket.on('error', (data) => {
			console.log(`WebSocket error: ${data}`)
			this.status(this.STATUS_ERROR, data)
		})

		socket.on('close', () => {
			console.warn('Websocket closed')
			this.status(this.STATUS_WARNING, "Socket closed")
		})
	}

	config_fields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				tooltip: 'The IP of the web server',
				width: 6,
				default: '127.0.0.1',
				regex: this.REGEX_IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port',
				tooltip: 'The port of the web socket server',
				width: 6,
				default: 9023,
				regex: this.REGEX_NUMBER,
			},
		]
	}

	setupFeedbacks() {
		const feedbacks = {}
		feedbacks['on_air_status'] = {
			label: 'Change colors when On-Air',
			description: 'Change colors when On-Air',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0, 0, 0),
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255, 0, 0),
				},
				{
					type: 'dropdown',
					id: 'title',
					label: 'Title',
					width: 6,
					choices: this.CHOICES_TITLES,
				},
			],
		}
		this.setFeedbackDefinitions(feedbacks)
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	destroy() {
		debug('destroy', this.id)
	}

	feedback(event) {
		let options = event.options

		if (event.type == 'on_air_status') {
			if (this.titlesPlayStatus[options.title] == 'Running' || this.titlesPlayStatus[options.title] == 'Paused') {
				return { color: options.fg, bgcolor: options.bg }
			}
		}
		return {}
	}

	actions(system) {
		const actions = {}

		actions['go_title'] = {
			label: 'go title',
			options: [
				{
					type: 'dropdown',
					id: 'title',
					label: 'Title',
					width: 6,
					choices: this.CHOICES_TITLES,
				},
			],
		}

		this.setActions(actions)
	}

		/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
		 async action(action) {
			const opt = action.options
			let cmd
	
			switch (action.action) {
				case 'go_title':
					scheduler.scheduleAction("automatic", "", opt.title, {});
					break
			}
			if (cmd != undefined) {
				// do stuff
			}
		}
	
}
exports = module.exports = instance
