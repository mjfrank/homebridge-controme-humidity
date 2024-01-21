# homebridge-controme-humidity
Homebridge plugin for controme thermostat to add humidity to HomeKit

## Configuration
The following parameters are mandatory:
```bash
"accessories": [
  {
    "accessory": "ContromeThermostat",
    "id": 1,
    "name": "Arbeitszimmer",
    "homeId": 1,
    "server": "https://test.fwd.controme.com",
    "serial": "b3-e2-27-14-a3-2b",
    "email": "testaccount@controme.com",
    "password": "test"
  }
]
```

The optional parameters are as follows:
```bash
"accessories": [
  {
    "pollInterval": 20
  }
]
```
