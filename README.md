# homebridge-mqtt-door

# Install:
```
sudo npm install -g homebridge-mqtt-door
```

# Config JSON - Example: 

```
{
  "accessory": "mqttdoor",
  "name": "Building Door",
  "url": "mqtt://192.168.1.160:1883",
  "username": "username",
  "password": "password",
  "caption": "BuildingDoor",
  "topics": {
    "statusGet":  "door/buiding",
    "statusSet":  "door/buiding/set"
  },
  "onValue": "UNLOCK",
  "offValue": "LOCK"
}
```
