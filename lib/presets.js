const fetch = require('node-fetch')

module.exports = {

    publishPresets(response) {
        var self = this;

        if (response != undefined) {
            const presets = [];
            var x = 0;
            response.forEach((preset) => {
                // remap custom images
                if (preset.bank != undefined && preset.bank.imageName != undefined) {
                    let imageData = this.images[`${preset.bank.imageName}`];
                    if (imageData != undefined) {
                        preset.bank.png64 = imageData;
                    }
                    delete preset.bank.imageName;
                }

                presets.push(preset);
                x++;
            });
            this.setPresetDefinitions(presets);
        }
    },

    initPresets(updates) {
        var self = this;

        if (this.USE_QWEBCHANNEL) {
            this.requestCompanionDefinition("presets")
                .then(response => {
                    this.publishPresets(response);
                }).catch((e) => {
                    console.error("error requesting presets", e);
                });
        } else {
            fetch(`http://${config.host}:8000/companion/presets`)
                .then(res => res.text())
                .then(text => {
                    let response = JSON.parse(text);
                    this.publishPresets(response);
                });
        }

    }

}