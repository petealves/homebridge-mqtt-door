# homebridge-mqtt-door

A Plugin that emulates a door in HomeKit. This simulates the door opening to 100% and going to 0%.
Do not ask, for example, to open the door at 20%, it will not work. It only works to fully open (100%) and closes it right away. It was firstly made to open an Apartment Building Door.

# Install:
```
sudo npm install -g homebridge-mqtt-door
```

# Config JSON - Example: 

```
{
  "accessory": "mqtt-door",
  "name": "Building Door",
  "url": "YOUR MQTT IP:PORT",
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
