const fetch = require('node-fetch')

module.exports = {


    setupFeedbacks(self) {
        if (this.USE_QWEBCHANNEL) {
            this.requestCompanionDefinition("feedbacks")
                .then(response => this.publishFeedbacks(response))
                .then(response => {
                    this.checkFeedbacks();
                    // disable cache rebuilding 
                    this.allowsFeedbackCacheRebuilding = false;
                })
                .catch((e) => {
                    console.error("error requesting feedbacks:", e);
                });
        } else {
            fetch(`http://${config.host}:8000/companion/feedbacks`)
                .then(res => res.text())
                .then(text => {
                    let response = JSON.parse(text);
                    this.publishFeedbacks(response.companion_actions);

                });
        }
    },

    publishFeedbacks(response) {
        var self = this;

        //console.log("publish feedbacks", response);
        if (response != undefined) {
            const feedbacks = {};
            var x = 0;
            response.forEach((feedback) => {

                //delete action.target;

                // we might not have the value in our local cache, so we will try to prime it
                feedback.subscribe = function(feedback) {
                    // prime the value
                    console.log("subscribed", feedback);
                    self.primeFeedbackState(feedback.type, feedback.options);
                };

                feedbacks[feedback.id] = feedback;
                x++;
            });
            this.setFeedbackDefinitions(feedbacks);
        }
    }


}