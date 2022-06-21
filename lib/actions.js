const fetch = require('node-fetch')

module.exports = {

    publishActions(response) {
        if (response != undefined) {
            const actions = {};
            var x = 0;
            response.forEach((action) => {
                const { target } = action;
                delete action.target;
                actions[target] = action;
                x++;
            });
            this.setActions(actions);
        }
    },

    setupActions(self) {
        var config = this.config;

        if (this.USE_QWEBCHANNEL) {
            this.requestCompanionDefinition("actions")
                .then(response => this.publishActions(response))
                .catch((e) => {
                    console.error("error requesting actions", e);
                });
        } else {
            fetch(`http://${config.host}:8000/companion/actions`)
                .then(res => res.text())
                .then(text => {
                    let response = JSON.parse(text);
                    this.publishActions(response.companion_actions);
                });
        }
    },

    /**
     * Executes the provided action.
     *
     * @param {Object} action - the action to be executed
     * @access public
     * @since 1.0.0
     */
    async action(action) {
        const opt = action.options


        if (this.USE_QWEBCHANNEL) {
            this.scheduler._cmp_v1_performAction(action.action, opt);
            return;
        }


        let cmd;


        switch (action.action) {
            case 'go_title':
                scheduler.scheduleAction('automatic', '', opt.title, {})
                break;
            case 'getTitleInfo':
                this.getControlInfo()
                break;
            default:
                fetch(`http://localhost:8000/companion/action/${action.action}`, {
                        method: 'POST',
                        body: JSON.stringify(opt),
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then(res => res.text())
                    .then(text => {
                        // response..
                    });


        }
        if (cmd != undefined) {
            // do stuff
        }
    }
}