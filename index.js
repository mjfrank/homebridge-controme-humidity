/**
 * Script file: index.js
 * Based on homebridge-controme-thermostat V4.0.2
 * Created on: 2024-01-21
 * Last modified on: 2024-01-21
 * Version 1.0
 * 
 * Comments:
 *  Python script to fetch the data from API
 *  Sample url: https://test.fwd.controme.com/get/json/v1/1/rooms/
 */

var request = require('request');
let Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-controme-humidity', 'ContromeThermostat', HumiditySensor);
};

class CurrentRelativeHumidity {
    constructor(log, config) {
        /* log instance */
        this.log = log;

        /* read configuration */
        this.id = config.id;
        this.name = config.name;
        this.homeId = config.homeId;
        this.serverAddress = config.server;
        this.serialNumber = config.serial;

        /* auth - essential */
        this.email = config.email || 'testaccount@controme.com';
        this.password = config.password || 'test'

        /* optional parameters */
        this.pollInterval = config.pollInterval || 30; // second

        /* initialize variables */
        this.CurrentRelativeHumidity = 10;

        /* run service */
        this.HumidityService = new Service.Humidity(this.name);
    }

    identify(callback) {
        this.log.debug('Accessory identified');
        callback(null);
    }

    getConfiguration(callback) {
        /* controme API request */
        var url = this.serverAddress + '/get/json/v1/' + this.homeId + '/homebridge';
        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var obj = JSON.parse(body);
                callback(null, obj);
            } else {
                callback(error);
            }
        });
    }
   
        readCurrentRelativeHumidity() {
        /* controme API request */
        var url = this.serverAddress + '/get/json/v1/' + this.homeId + '/temps/' + this.id;
        request(url, (error, response, body) => {
            /* API request successful */
            if (!error && response.statusCode == 200) {
                 var obj = JSON.parse(body)[0];

                /* only valid when the id is matched */
                if (obj.id == this.id) {
                    /* get current humidity */
                    if (obj.luftfeuchte !== null && this.CurrentRelativeHumidity != obj.luftfeuchte) {
                        this.CurrentRelativeHumidity = obj.luftfeuchte;
                        this.HumidityService
                            .setCharacteristic(Characteristic.CurrentRelativeHumidity, this.CurrentRelativeHumidity);
                    }
                }
            }
        });
    }
    getServices() {
        this.informationService = new Service.AccessoryInformation();
        this.informationService
            .setCharacteristic(Characteristic.Manufacturer, 'Controme')
            .setCharacteristic(Characteristic.Model, 'Thermostat API')
            .setCharacteristic(Characteristic.SerialNumber, this.serialNumber);

        /* Current Relative Humidity */
        this.HumidityService
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on('get', callback => {
                this.log.debug('Current Relative Humidity:', this.CurrentRelativeHumidity);
                callback(null, this.CurrentRelativeHumidity);
            });
     

        /* service name */
        this.HumidityService
            .getCharacteristic(Characteristic.Name)
            .on('get', callback => {
                callback(null, this.name);
            });

        /**
         * https://developers.google.com/analytics/devguides/reporting/core/v3/limits-quotas
         * The number of requests to the API is restricted to a maximum of 10 requests per second per user
         * The solution is to add timeouts into the plugin
         */

        setTimeout(() => {
        	/* read first humidity */
            this.readCurrentRelativeHumidity();

            /* scheduling */
            setInterval(() => {
                this.readCurrentRelativeHumidity();
            }, 1000 * this.pollInterval);
        }, Math.random() * 1000);
        

        return [this.informationService, this.HumidityService];
    }
}
