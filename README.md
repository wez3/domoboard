# Domoboard

Domoboard is a dashboard for Domoticz based on Python Flask. The decision was made to use Domoticz as an backend because it is a powerful framework for home automation. Flask was choosen to get all the powerful features that Python offers.

# Quick install

Run the following commando to install Domoboard and its dependencies in the current directory:

```
curl -L https://www.domoboard.nl/install | bash
```

# Manual installation

To manually install Domoboard, take the steps below. 

Clone the git:

```
cd /home/pi
git clone https://github.com/wez3/domoboard
```

Install virtualenv:

```
sudo apt-get install python-virtualenv
```

Create the virtualenv:

```
virtualenv /home/pi/domoboard/
```

Start the virtualenv:

```
cd /home/pi/domoboard/
source bin/activate
```

Install Domoboard dependencies:

```
pip install -r requirements.txt
```

Modify the config file to suit your needs. Start Domoboard by executing:

```
python server.py -c <config_file>
```

It is possible to run Domoboard in "debug" mode by running the command:
```
python server.py -c <config_file> -d
```

To reactivate the virtualenv later on repeat the "Start the virtualenv" step. 

# Install as a service

To configure Domoboard as a service, create a new file /etc/systemd/system/domoboard.service with the following contents (modify paths if Domoboard is not located at /home/pi):

```
[Unit]
Description=Domoboard dashboard

[Service]
ExecStart=/home/pi/domoboard/bin/python /home/pi/domoboard/server.py -d -c /home/pi/domoboard/config.conf
WorkingDirectory=/home/pi/domoboard/
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Now run the following command to enable the service:

```
sudo systemctl enable domoboard.service 
```

Now run the following command to start the service:

```
sudo systemctl start domoboard.service 
```

Please note that if you are running Domoboard on ports <= 1024 a user with permissions needs to be specified (User and Group under [Service]). Otherwise Domoboard cannot bind to the port due to a permission denied error. 

# Configuration

Just one config is used to configure Domoboard. A example can be found the applications root ("example.conf"). The following display components are currently supported:
- top_tiles
- switches
  - switch
  - Selector Switch
  - dimmer
  - rgb
  - setpoint
  - setpoint_slider
  - pushon
  - pushoff
  - group
  - scene
- camera
- weather
- news
- map
- domoticz_temp_charts
- domoticz_smart_charts
- domoticz_counter_charts
- domoticz_percentage_charts
- line_charts
- area_charts
- bar_charts
- donut_charts
- power_usage
- serverlog
- settings

# API

Domoboard has an API which can be found at "/api". All JavaScript files that update data frequently are using this API to obtain the information that is going to be displayed. By default all requests to the API are passed to the Domoticz backend. This means that Domoboard accepts the same API calls as Domoticz does.  However the API also allows an plugin developer to add its own API functions by creating an Python module. Developers can specify a "custom" GET-parameter which is patched in to the current API, this allows the developer to run their own Python functions when the API is called.

# Modulair

Domoboard is a framework which allows users to build custom plugins pretty easy. Plugins require the following at least:
- A HTML file in the templates/ folder (see templates/hello.html as an example)

For advanced features, such as custom API functions a developer needs to develop:
- A Python file in the plugins/ folder (see plugins/hello.py as an example)

The following plugins have been developed by now:
- iCloud plugin
- Traffic plugin

Check out the page https://github.com/wez3/domoboard-plugins for all plugins.

# Screenshots

Here are some screenshots from Domoboard:

![alt tag](https://domoboard.nl/domoboard_images/domoboard_1_1.png)

Above screenshot shows the components top_tiles, line_charts, switches and weather.

![alt tag](https://domoboard.nl/domoboard_images/domoboard_2_2_2_2.png)

Above screenshot shows the mobile view of the Dashboard.

![alt tag](https://domoboard.nl/domoboard_images/domoboard_6_6_6_6.png)

Above screenshot shows the Raspberry Pi 7" Touch screen view of the Dashboard.

![alt tag](https://domoboard.nl/domoboard_images/screen_domoticz.png)

Above the components domoticz_smart_charts, domoticz_counter_charts and domoticz_temp_charts.

![alt tag](https://domoboard.nl/domoboard_images/domoboard_3_3.png)

Above screenshot shows the components bar_charts, donut_charts, switches and power_usage components.

![alt tag](https://domoboard.nl/domoboard_images/domoboard_4_4.png)

Above screenshots shows the server log component

![alt tag](https://domoboard.nl/domoboard_images/domoboard_5_5.png)

Above screenshots shows the settings page.

# Contributing

Everybody can contribute to the project! For development purposes the "develop" branch is used. The "master" branch contains the stable version of Domoboard.

Please let us know when you've created a plugin, so we can can add to the plugin Github repository.

# Special thanks

Special thanks to https://github.com/squandor for developing and testing on Domoboard before it was made public.
