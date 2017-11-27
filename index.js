// MQTT Door Accessory plugin for HomeBridge
//
// Remember to add accessory to config.json. Example:
// "accessories": [
    // {
    //        "accessory": "mqttdoor",
    //        "name": "PUT THE NAME OF YOUR DOOR HERE",
    //        "url": "PUT URL OF THE BROKER HERE",
			 //  "username": "PUT USERNAME OF THE BROKER HERE",
    //        "password": "PUT PASSWORD OF THE BROKER HERE"
			 //  "caption": "PUT THE LABEL OF YOUR DOOR HERE",
			 //  "topics": {
				// "statusGet": 	"PUT THE MQTT TOPIC FOR THE GETTING THE STATUS OF YOUR DOOR HERE",
				// "statusSet": 	"PUT THE MQTT TOPIC FOR THE SETTING THE STATUS OF YOUR DOOR HERE"
			 //  },
			 //  "onValue": "OPTIONALLY PUT THE VALUE THAT MEANS ON HERE (DEFAULT true)",
			 //  "offValue": "OPTIONALLY PUT THE VALUE THAT MEANS OFF HERE (DEFAULT false)",
			 //  "statusCmd": "OPTIONALLY PUT THE STATUS COMMAND HERE",
			 //  "integerValue": "OPTIONALLY SET THIS TRUE TO USE 1/0 AS VALUES",
    // }
// ],
//
// When you attempt to add a device, it will ask for a "PIN code".
// The default code for all HomeBridge accessories is 031-45-154.

'use strict';

var Service, Characteristic;
var mqtt = require("mqtt");

function MqttDoorAccessory(log, config) {
    this.log        	= log;
    this.name 			= config["name"];
    this.url 			= config["url"];
    this.publish_options = {
        qos: 	((config["qos"] !== undefined) ? config["qos"] : 0),
        retain: ((config["retain"] !== undefined) ? config["retain"] : false)
    };
    this.client_Id 		= 'mqttjs_' + Math.random().toString(16).substr(2, 8);
    this.options = {
        keepalive: 10,
        clientId: this.client_Id,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        will: {
            topic: 'WillMsg',
            payload: 'Connection Closed abnormally..!',
            qos: 0,
            retain: ((config["retain"] !== undefined) ? config["retain"] : false)
        },
        username: config["username"],
        password: config["password"],
        rejectUnauthorized: false
    };
    this.caption		= config["caption"];
    this.topicStatusGet	= config["topics"].statusGet;
    this.topicStatusSet	= config["topics"].statusSet;
    this.onValue 		= (config["onValue"] !== undefined) ? config["onValue"]: "true";
    this.offValue 		= (config["offValue"] !== undefined) ? config["offValue"]: "false";
    if (config["integerValue"]) {
        this.onValue 	= "1";
        this.offValue 	= "0";
    }
    this.statusCmd 		= config["statusCmd"];

    this.doorStatus 	= false;

    this.service 		= new Service.Door(this.name);

    this.service
        .getCharacteristic(Characteristic.TargetPosition)
        .on('get', this.getStatus.bind(this))
        .on('set', this.setStatus.bind(this));

    // connect to MQTT broker
    this.client 		= mqtt.connect(this.url, this.options);
    var that 			= this;
    this.client.on('error', function () {
        that.log('Error event on MQTT');
    });
    this.client.on('message', function (topic, message) {
        //console.log('[client.on message] topic: ' + topic);
        //console.log('[client.on message] message: ' + message);
        if (topic == that.topicStatusGet) {
            var status = message.toString();
            if (status == that.onValue || status == that.offValue) {
                that.doorStatus = (status == that.onValue) ? true : false;
                //console.log('[client.on message] doorStatus: ' + that.doorStatus);
                that.service.getCharacteristic(Characteristic.TargetPosition).setValue(that.doorStatus ? 100 : 0, undefined, 'fromSetValue');
            }
        }
    });
    this.client.subscribe(this.topicStatusGet);
}

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-mqttdoor", "mqttdoor", MqttDoorAccessory);
};

MqttDoorAccessory.prototype.getStatus = function(callback) {

    if (this.statusCmd !== undefined) {
        this.client.publish(this.topicStatusSet, this.statusCmd, this.publish_options);
    }
    callback(null, this.doorStatus);
};

MqttDoorAccessory.prototype.setStatus = function(status, callback, context) {
    console.log(status);
    if(context !== 'fromSetValue') {
        this.doorStatus = status;
        this.client.publish(this.topicStatusSet, status == 100 ? this.onValue : this.offValue, this.publish_options);
    }
    callback();
};

MqttDoorAccessory.prototype.getServices = function() {
    return [this.service];
};