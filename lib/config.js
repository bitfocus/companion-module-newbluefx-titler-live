module.exports = { 

    config_fields() {

        return [
            {
                type: 'text',
                id: 'info',	
                width: 12,			
                label: 'About NewBlue Companion Plugin for Titler Live',
                value: 'This module is used to control NewBlue TitlerLive .'
            },
            {
                type: 'textinput',
                id: 'host',
                label: 'Target Hostname/IP',
                tooltip: 'The IP or hostname of your Titler instance',
                width: 6,
                default: '127.0.0.1'
            },
            {
                type: 'number',
                label: 'Port',
                id: 'port',
                min: 1,
                max: 65535,
                default: 9023,
                required: true
            }

            

        ]
    }

}
