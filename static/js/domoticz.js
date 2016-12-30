/*
 Code originating from: (c) 2012-2016 Domoticz.com, Robbert E. Peters
 Modifications made for Domoboard
*/

$.myglobals = {
    actlayout : "",
    prevlayout : "",
    ismobile: false,
    ismobileint: false,
    windscale: 1.0,
    windsign: "m/s",
    tempscale: 1.0,
    tempsign: "C",
    DegreeDaysBaseTemperature: 18.0,
    historytype : 1,
    LastPlanSelected: 0,
    DashboardType: 0,
    isproxied: false
  };

function ShowSmartLog(contentdiv, id, name, switchtype, period) {
	switch(switchtype) {
    case "energy":
        switchtype = 0;
	break;
    case "gas":
        switchtype = 1;
        break;
    case "water":
        switchtype = 2;
        break;
    case "counter":
         switchtype = 3;
         break;
    default:
	 switchtype = 0;
	 break;
}
	$('#modal').show();
	$.content = contentdiv;
	$.devIdx = id;
	$.devName = name;
	$.devSwitchType = switchtype;
	var htmlcontent = '';
	htmlcontent = '<p><center><h2>' + unescape(name) + '</h2></center></p>\n';
	htmlcontent += $('#' + contentdiv).html();

	$.costsT1 = 0.2389;
	$.costsT2 = 0.2389;
	$.costsGas = 0.6218;
	$.costsWater = 1.6473;

	requestAPI("/api?type=command&param=getcosts&idx=" + $.devIdx,
		function (data) {
			data = JSON.parse(data);
			$.costsT1 = parseFloat(data.CostEnergy) / 10000;
			$.costsT2 = parseFloat(data.CostEnergyT2) / 10000;
			$.costsGas = parseFloat(data.CostGas) / 10000;
			$.costsWater = parseFloat(data.CostWater) / 10000;
			$.CounterT1 = parseFloat(data.CounterT1);
			$.CounterT2 = parseFloat(data.CounterT2);
			$.CounterR1 = parseFloat(data.CounterR1);
			$.CounterR2 = parseFloat(data.CounterR2);
	});

	$.costsR1 = $.costsT1;
	$.costsR2 = $.costsT2;

	$.monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];

	var d = new Date();
	var actMonth = d.getMonth() + 1;
	var actYear = d.getYear() + 1900;

if (period == "day") {
	var DayChart = $('#' + contentdiv);
	DayChart.highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			events: {
				load: function () {
 					requestAPI("/api?type=graph&sensor=counter&idx=" + id + "&range=day",
					function (data) {
						data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							AddDataToUtilityChart(data, DayChart, switchtype);
							DayChart.highcharts().redraw();
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: [{
			title: {
				text: 'Energy (Wh)'
			},
			min: 0
		},
		{
			title: {
				text: 'Power (Watt)'
			},
			min: 0,
			opposite: true
		}],
		tooltip: {
			crosshairs: true,
			shared: true
		},
		plotOptions: {
			series: {
				point: {
					events: {
						click: function (event) {
							chartPointClickNewEx(event, true, ShowSmartLog);
						}
					}
				}
			},
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		legend: {
			enabled: true
		}
	});

} else if (period == "week") {

	$.WeekChart = $('#' + contentdiv);
	$.WeekChart.highcharts({
		chart: {
			type: 'column',
			marginRight: 10,
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=counter&idx=" + id + "&range=week",
					function (data) {
						data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							AddDataToUtilityChart(data, $.WeekChart, switchtype);
							$.WeekChart.highcharts().redraw();
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: {
				day: '%a'
			},
			tickInterval: 24 * 3600 * 1000
		},
		yAxis: {
			title: {
				text: 'Energy (kWh)'
			},
			min: 0
		},
		tooltip: {
			formatter: function () {
				var unit = GetGraphUnit(this.series.name);
				return Highcharts.dateFormat('%A', this.x) + ' ' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '<br/>' + this.series.name + ': ' + this.y + ' ' + unit + '<br/>Total: ' + this.point.stackTotal + ' ' + unit;
			}
		},
		plotOptions: {
			column: {
				stacking: 'normal',
				minPointLength: 4,
				pointPadding: 0.1,
				groupPadding: 0
			}
		},
		legend: {
			enabled: true
		}
	});

} else if (period == "month") {

	$.MonthChart = $('#' + contentdiv);
	$.MonthChart.highcharts({
		chart: {
			type: 'spline',
			marginRight: 10,
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=counter&idx=" + id + "&range=month",
					function (data) {
						data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							AddDataToUtilityChart(data, $.MonthChart, switchtype);
							$.MonthChart.highcharts().redraw();
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: {
			title: {
				text: 'Energy (kWh)'
			},
			min: 0
		},
		tooltip: {
			crosshairs: true,
			shared: true
		},
		plotOptions: {
			series: {
				point: {
					events: {
						click: function (event) {
							chartPointClickNewEx(event, false, ShowSmartLog);
						}
					}
				}
			},
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		legend: {
			enabled: true
		}
	});

} else if (period == "year") {

	$.YearChart = $('#' + contentdiv);
	$.YearChart.highcharts({
		chart: {
			type: 'spline',
			marginRight: 10,
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=counter&idx=" + id + "&range=year",
					function (data) {
						data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							AddDataToUtilityChart(data, $.YearChart, switchtype);
							$.YearChart.highcharts().redraw();
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: {
			title: {
				text: 'Energy (kWh)'
			},
			min: 0
		},
		tooltip: {
			crosshairs: true,
			shared: true
		},
		plotOptions: {
			series: {
				point: {
					events: {
						click: function (event) {
							chartPointClickNewEx(event, false, ShowSmartLog);
						}
					}
				}
			},
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		legend: {
			enabled: true
		}
	});
}
}


function ShowGeneralGraph(contentdiv, id, name, switchtype, sensortype, period) {
	$('#modal').show();
	$.content = contentdiv;
	$.devIdx = id;
	$.devName = name;
	$.switchtype = switchtype;
	$.sensortype = sensortype;
	var htmlcontent = '';
	htmlcontent = '<p><center><h2>' + unescape(name) + '</h2></center></p>\n';
	htmlcontent += $('#' + contentdiv).html();

	var txtLabelOrg = sensortype;
	var txtUnit = "?";

	var graphtype="counter";

	if (sensortype == "Custom Sensor") {
		txtUnit = unescape(switchtype);
		graphtype = "Percentage";
	}
	else if (sensortype == "Visibility") {
		txtUnit = "km";
		if (switchtype == 1) {
			txtUnit = "mi";
		}
	}
	else if (sensortype == "Radiation") {
		txtUnit = "Watt/m2";
	}
	else if (sensortype == "Pressure") {
		txtUnit = "Bar";
	}
	else if (sensortype == "Soil Moisture") {
		txtUnit = "cb";
	}
	else if (sensortype == "Leaf Wetness") {
		txtUnit = "Range";
	}
	else if ((sensortype == "Voltage") || (sensortype == "A/D")) {
		txtUnit = "mV";
	}
	else if (sensortype == "VoltageGeneral") {
		txtLabelOrg = "Voltage";
		txtUnit = "V";
	}
	else if ((sensortype == "DistanceGeneral") || (sensortype == "Distance")) {
		txtLabelOrg = "Distance";
		txtUnit = "cm";
		if (switchtype == 1) {
			txtUnit = "in";
		}
	}
	else if (sensortype == "Sound Level") {
		txtUnit = "dB";
	}
	else if ((sensortype == "CurrentGeneral") || (sensortype == "Current")) {
		txtLabelOrg = "Current";
		txtUnit = "A";
	}
	else if (switchtype == "Weight") {
		txtUnit = "kg";
	}
	else if (sensortype == "Waterflow") {
		txtUnit = "l/min";
		graphtype = "Percentage";
	}
	else {
		return;
	}

	var txtLabel = txtLabelOrg + ' (' + txtUnit + ')'
	var txtTopLabel = txtLabelOrg
	if (sensortype == "Custom Sensor") {
		txtLabel = txtUnit;
		txtTopLabel = "";
	}

if (period == "day") {
	$.LogChart1 = $('#' + contentdiv);
	$.LogChart1.highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			marginRight: 10,
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=" + graphtype + "&idx=" + id + "&range=day",
					function (data) {
						data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							var datatable = [];
							var minValue = 10000000;
							$.each(data.result, function (i, item) {
								datatable.push([GetUTCFromString(item.d), parseFloat(item.v)]);
								minValue = Math.min(item.v, minValue);
							});
							$.LogChart1.highcharts().yAxis[0].update({ min: minValue });
							var series = $.LogChart1.highcharts().series[0];
							series.setData(datatable);
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: {
			title: {
				text: txtLabel
			},
			labels: {
				formatter: function () {
					if (txtUnit == "mV") {
						return Highcharts.numberFormat(this.value, 0);
					}
					return this.value;
				}
			},
			min: 0,
			minorGridLineWidth: 0,
			alternateGridColor: null
		},
		tooltip: {
				backgroundColor: '#FFF',
				borderColor: '#73879C',
				borderRadius: 10,
				borderWidth: 3
		},
		plotOptions: {
			series: {
				point: {
					events: {
						click: function (event) {
							chartPointClickNewGeneral(event, true, ShowGeneralGraph);
						}
					}
				}
			},
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		series: [{
			id: 'log1',
			showInLegend: false,
			name: txtTopLabel
		}]
		,
		navigation: {
			menuItemStyle: {
				fontSize: '10px'
			}
		}
	});

} else if (period == "month") {
	$.LogChart2 = $('#' + contentdiv);
	$.LogChart2.highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			marginRight: 10,
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=" + graphtype + "&idx=" + id + "&range=month",
					function (data) {
						data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							var datatable1 = [];
							var datatable2 = [];
							var datatable3 = [];
							var minValue = 10000000;

							$.each(data.result, function (i, item) {
								console.log(item)
								datatable1.push([GetDateFromString(item.d), parseFloat(item.v_max)]);
								datatable2.push([GetDateFromString(item.d), parseFloat(item.v_min)]);
								if (typeof item.v_avg != 'undefined') {
									var avg_val = parseFloat(item.v);
									if (avg_val!=0) {
										datatable3.push([GetDateFromString(item.d), avg_val]);
									}
								}
								minValue = Math.min(item.v_max, minValue);
								minValue = Math.min(item.v_min, minValue);

							});
							$.LogChart2.highcharts().yAxis[0].update({ min: minValue });
							var series1 = $.LogChart2.highcharts().series[0];
							var series2 = $.LogChart2.highcharts().series[1];

							series1.setData(datatable1);
							series2.setData(datatable2);
							if (datatable3.length>0) {
								var series3 = $.LogChart2.highcharts().series[2];
								series3.setData(datatable3);
							}
							else {
								$.LogChart2.highcharts().series[2].remove();
							}
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: {
			title: {
				text: txtLabel
			},
			labels: {
				formatter: function () {
					if (txtUnit == "mV") {
						return Highcharts.numberFormat(this.value, 0);
					}
					return this.value;
				}
			},
			min: 0,
			minorGridLineWidth: 0,
			alternateGridColor: null
		},
		tooltip: {
			crosshairs: true,
			shared: true
		},
		plotOptions: {
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		series: [{
			id: 'logmin2',
			name: 'min',
			tooltip: {
				valueSuffix: ' ' + txtUnit
			},
			point: {
				events: {
					click: function (event) {
						chartPointClickNewGeneral(event, false, ShowGeneralGraph);
					}
				}
			}
		}, {
			id: 'logmax2',
			name: 'max',
			tooltip: {
				valueSuffix: ' ' + txtUnit
			},
			point: {
				events: {
					click: function (event) {
						chartPointClickNewGeneral(event, false, ShowGeneralGraph);
					}
				}
			}
		}, {
			id: 'logavg2',
			name: 'avg',
			tooltip: {
				valueSuffix: ' ' + txtUnit
			},
			point: {
				events: {
					click: function (event) {
						chartPointClickNewGeneral(event, false, ShowGeneralGraph);
					}
				}
			}
		}]
		,
		navigation: {
			menuItemStyle: {
				fontSize: '10px'
			}
		}
	});

} else if (period == "year") {

	$.LogChart3 = $('#' + contentdiv);
	$.LogChart3.highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			marginRight: 10,
			events: {
				load: function () {

					requestAPI("/api?type=graph&sensor=" + graphtype + "&idx=" + id + "&range=year",
					function (data) {
						data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							var datatable1 = [];
							var datatable2 = [];
							var datatable3 = [];
							var minValue = 10000000;

							$.each(data.result, function (i, item) {
								console.log(item)
								datatable1.push([GetDateFromString(item.d), parseFloat(item.v2)]);
								datatable2.push([GetDateFromString(item.d), parseFloat(item.v)]);
								if (typeof item.v_avg != 'undefined') {
									var avg_val = parseFloat(item.v_avg);
									if (avg_val!=0) {
										datatable3.push([GetDateFromString(item.d), avg_val]);
									}
								}
								minValue = Math.min(item.v2, minValue);
								minValue = Math.min(item.v, minValue);
							});
							$.LogChart3.highcharts().yAxis[0].update({ min: minValue });
							var series1 = $.LogChart3.highcharts().series[0];
							var series2 = $.LogChart3.highcharts().series[1];
							series1.setData(datatable1);
							series2.setData(datatable2);
							if (datatable3.length>0) {
								var series3 = $.LogChart3.highcharts().series[2];
								series3.setData(datatable3);
							}
							else {
								$.LogChart3.highcharts().series[2].remove();
							}
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: {
			title: {
				text: txtLabel
			},
			labels: {
				formatter: function () {
					if (txtUnit == "mV") {
						return Highcharts.numberFormat(this.value, 0);
					}
					return this.value;
				}
			},
			min: 0,
			minorGridLineWidth: 0,
			alternateGridColor: null
		},
		tooltip: {
			formatter: function () {
				return '' +
				Highcharts.dateFormat('%A', this.x) + '<br/>' + Highcharts.dateFormat('%Y-%m-%d %H:%M', this.x) + ': ' + this.y + ' ' + txtUnit;
			}
		},
		plotOptions: {
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		series: [{
			id: 'log3min',
			name: 'min',
			point: {
				events: {
					click: function (event) {
						chartPointClickNewGeneral(event, false, ShowGeneralGraph);
					}
				}
			}
		}, {
			id: 'log3max',
			name: 'max',
			point: {
				events: {
					click: function (event) {
						chartPointClickNewGeneral(event, false, ShowGeneralGraph);
					}
				}
			}
		}, {
			id: 'log3avg',
			name: 'avg',
			point: {
				events: {
					click: function (event) {
						chartPointClickNewGeneral(event, false, ShowGeneralGraph);
					}
				}
			}
		}]
		,
		navigation: {
			menuItemStyle: {
				fontSize: '10px'
			}
		}
	});
}
}

function ShowPercentageLog(contentdiv, id, name, period) {
	$('#modal').show();
	$.content = contentdiv;
	$.devIdx = id;
	$.devName = name;
	var htmlcontent = '';
	htmlcontent = '<p><center><h2>' + unescape(name) + '</h2></center></p>\n';
	htmlcontent += $('#' + contentdiv).html();
	$.DayChart_Percentage = $('#' + contentdiv);

  if (period == "day") {
	$.DayChart_Percentage.highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			marginRight: 10,
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=Percentage&idx=" + id + "&range=day", function (data) {
            data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							var series = $.DayChart_Percentage.highcharts().series[0];
							var datatable = [];
							var minValue = 10000000;
							$.each(data.result, function (i, item) {
								datatable.push([GetUTCFromString(item.d), parseFloat(item.v)]);
								minValue = Math.min(item.v, minValue);
							});
							$.DayChart_Percentage.highcharts().yAxis[0].update({ min: minValue });
							series.setData(datatable); // redraws
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: {
			title: {
				text: 'Percentage'
			},
			min: 0,
			minorGridLineWidth: 0,
			alternateGridColor: null
		},
		tooltip: {
			crosshairs: true,
			shared: true
		},
		plotOptions: {
			series: {
				point: {
					events: {
						click: function (event) {
							chartPointClickNew(event, true, ShowPercentageLog);
						}
					}
				}
			},
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		series: [{
			id: 'percentage',
			name: 'Percentage',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
		}]
		  ,
		navigation: {
			menuItemStyle: {
				fontSize: '10px'
			}
		}
	});

} else if (period == "month") {
	$.MonthChart_Percentage = $('#' + contentdiv);
	$.MonthChart_Percentage.highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			marginRight: 10,
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=Percentage&idx=" + id + "&range=month", function (data) {
            data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							var datatable1 = [];
							var datatable2 = [];
							var datatable3 = [];
							var minValue = 10000000;

							$.each(data.result, function (i, item) {
								datatable1.push([GetDateFromString(item.d), parseFloat(item.v_min)]);
								datatable2.push([GetDateFromString(item.d), parseFloat(item.v_max)]);
								datatable3.push([GetDateFromString(item.d), parseFloat(item.v_avg)]);
								minValue = Math.min(item.v_min, minValue);
							});

							$.MonthChart_Percentage.highcharts().yAxis[0].update({ min: minValue });
							var series1 = $.MonthChart_Percentage.highcharts().series[0];
							var series2 = $.MonthChart_Percentage.highcharts().series[1];
							var series3 = $.MonthChart_Percentage.highcharts().series[2];
							series1.setData(datatable1, false);
							series2.setData(datatable2, false);
							series3.setData(datatable3, false);
							$.MonthChart_Percentage.highcharts().redraw();
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: {
			title: {
				text: 'Percentage'
			},
			min: 0,
			minorGridLineWidth: 0,
			alternateGridColor: null
		},
		tooltip: {
			crosshairs: true,
			shared: true
		},
		plotOptions: {
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		series: [{
			id: 'percentage_min',
			name: 'min',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function (event) {
						chartPointClickNew(event, false, ShowPercentageLog);
					}
				}
			}
		}, {
			id: 'percentage_max',
			name: 'max',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function (event) {
						chartPointClickNew(event, false, ShowPercentageLog);
					}
				}
			}
		}, {
			id: 'percentage_avg',
			name: 'avg',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function (event) {
						chartPointClickNew(event, false, ShowPercentageLog);
					}
				}
			}
		}]
		  ,
		navigation: {
			menuItemStyle: {
				fontSize: '10px'
			}
		}
	});

} else if (period == "year") {

	$.YearChart_Percentage = $('#' + contentdiv);
	$.YearChart_Percentage.highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			marginRight: 10,
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=Percentage&idx=" + id + "&range=year", function (data) {
            data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							var datatable1 = [];
							var datatable2 = [];
							var datatable3 = [];
							var minValue = 10000000;

							$.each(data.result, function (i, item) {
								datatable1.push([GetDateFromString(item.d), parseFloat(item.v_min)]);
								datatable2.push([GetDateFromString(item.d), parseFloat(item.v_max)]);
								datatable3.push([GetDateFromString(item.d), parseFloat(item.v_avg)]);
								minValue = Math.min(item.v_min, minValue);
							});
							$.YearChart_Percentage.highcharts().yAxis[0].update({ min: minValue });
							var series1 = $.YearChart_Percentage.highcharts().series[0];
							var series2 = $.YearChart_Percentage.highcharts().series[1];
							var series3 = $.YearChart_Percentage.highcharts().series[2];
							series1.setData(datatable1, false);
							series2.setData(datatable2, false);
							series3.setData(datatable3, false);
							$.YearChart_Percentage.highcharts().redraw();
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: {
			title: {
				text: 'Percentage'
			},
			min: 0,
			minorGridLineWidth: 0,
			alternateGridColor: null
		},
		tooltip: {
			crosshairs: true,
			shared: true
		},
		plotOptions: {
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		series: [{
			id: 'percentage_min',
			name: 'min',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function (event) {
						chartPointClickNew(event, false, ShowPercentageLog);
					}
				}
			}
		}, {
			id: 'percentage_max',
			name: 'max',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function (event) {
						chartPointClickNew(event, false, ShowPercentageLog);
					}
				}
			}
		}, {
			id: 'percentage_avg',
			name: 'avg',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function (event) {
						chartPointClickNew(event, false, ShowPercentageLog);
					}
				}
			}
		}]
		  ,
		navigation: {
			menuItemStyle: {
				fontSize: '10px'
			}
		}
	});
}
	$('#modal').hide();
	return false;
}

function ShowTempLog(contentdiv, id, name, period) {
	$('#modal').show();
	$.content = contentdiv;
	$.devIdx = id;
	$.devName = name;
	var htmlcontent = '';
	htmlcontent = '<p><center><h2>' + unescape(name) + '</h2></center></p>\n';
	htmlcontent += $('#' + contentdiv).html();

	var d = new Date();
	var actMonth = d.getMonth() + 1;
	var actYear = d.getYear() + 1900;

	var tempstr = "Celsius";

if (period == "day") {
	$.DayChart_Temp = $('#' + contentdiv);
	$.DayChart_Temp.highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=temp&idx=" + id + "&range=day", function (data) {
						data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							AddDataToTempChart(data, $.DayChart_Temp.highcharts(), 1);
							$.DayChart_Temp.highcharts().redraw();
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: [{ //temp label
			labels: {
				formatter: function () {
					return this.value + '\u00B0 ' + "C"
				}
			},
			title: {
				text:''
			}
		}, { //humidity label
			labels: {
				formatter: function () {
					return this.value + '%';
				}
			},
			title: {
				text:''
			},
			opposite: true
		}],
		tooltip: {
			crosshairs: true,
			shared: true
		},
		plotOptions: {
			series: {
				point: {
					events: {
						click: function (event) {
							chartPointClickNew(event, true, ShowTempLog);
						}
					}
				}
			},
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		legend: {
			enabled: true
		}
	});

} else if (period == "month") {

	$.MonthChart_Temp = $('#' + contentdiv);
	$.MonthChart_Temp.highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=temp&idx=" + id + "&range=month", function (data) {
						data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							AddDataToTempChart(data, $.MonthChart_Temp.highcharts(), 0);
							$.MonthChart_Temp.highcharts().redraw();
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: [{ //temp label
			labels: {
				format: '{value}\u00B0 ' + "C"
			},
			title: {
				text:''
			}
		}, { //humidity label
			labels: {
				format: '{value}%'
			},
			title: {
				text:''
			},
			opposite: true
		}],
		tooltip: {
			crosshairs: true,
			shared: true
		},
		plotOptions: {
			series: {
				point: {
					events: {
						click: function (event) {
							chartPointClickNew(event, false, ShowTempLog);
						}
					}
				}
			},
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		legend: {
			enabled: true
		}
	});

} else if (period == "year") {

	$.YearChart_Temp = $('#' + contentdiv);
	$.YearChart_Temp.highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			resetZoomButton: {
				position: {
					x: -30,
					y: -36
				}
			},
			events: {
				load: function () {
					requestAPI("/api?type=graph&sensor=temp&idx=" + id + "&range=year", function (data) {
						data = JSON.parse(data);
						if (typeof data.result != 'undefined') {
							AddDataToTempChart(data, $.YearChart_Temp.highcharts(), 0);
							$.YearChart_Temp.highcharts().redraw();
						}
					});
				}
			}
		},
		credits: {
			enabled: true,
			href: "http://www.domoticz.com",
			text: "Domoticz.com"
		},
		title: {
			text:''
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: [{ //temp label
			labels: {
				format: '{value}\u00B0 ' + "C"
			},
			title: {
				text:''
			}
		}, { //humidity label
			labels: {
				format: '{value}%'
			},
			title: {
				text:''
			},
			opposite: true
		}],
		tooltip: {
			crosshairs: true,
			shared: true
		},
		plotOptions: {
			series: {
				point: {
					events: {
						click: function (event) {
							chartPointClickNew(event, false, ShowTempLog);
						}
					}
				}
			},
			spline: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		legend: {
			enabled: true
		}
	});
}
	$('#modal').hide();
	//cursordefault();
	return true;
}

function AddDataToTempChart(data, chart, isday) {
	var datatablete = [];
	var datatabletm = [];
	var datatableta = [];
	var datatabletrange = [];

	var datatablehu = [];
	var datatablech = [];
	var datatablecm = [];
	var datatabledp = [];
	var datatableba = [];

	var datatablese = [];
	var datatablesm = [];
	var datatablesx = [];
	var datatablesrange = [];

	var datatablete_prev = [];
	var datatabletm_prev = [];
	var datatableta_prev = [];
	var datatabletrange_prev = [];

	var datatablehu_prev = [];
	var datatablech_prev = [];
	var datatablecm_prev = [];
	var datatabledp_prev = [];
	var datatableba_prev = [];

	var datatablese_prev = [];
	var datatablesm_prev = [];
	var datatablesx_prev = [];
	var datatablesrange_prev = [];

	var bHavePrev = (typeof data.resultprev != 'undefined');
	if (bHavePrev) {
		$.each(data.resultprev, function (i, item) {
			if (typeof item.te != 'undefined') {
				datatablete_prev.push([GetPrevDateFromString(item.d), parseFloat(item.te)]);
				datatabletm_prev.push([GetPrevDateFromString(item.d), parseFloat(item.tm)]);
				datatabletrange_prev.push([GetPrevDateFromString(item.d), parseFloat(item.tm), parseFloat(item.te)]);
				if (typeof item.ta != 'undefined') {
					datatableta_prev.push([GetPrevDateFromString(item.d), parseFloat(item.ta)]);
				}
			}
			if (typeof item.hu != 'undefined') {
				datatablehu_prev.push([GetPrevDateFromString(item.d), parseFloat(item.hu)]);
			}
			if (typeof item.ch != 'undefined') {
				datatablech_prev.push([GetPrevDateFromString(item.d), parseFloat(item.ch)]);
				datatablecm_prev.push([GetPrevDateFromString(item.d), parseFloat(item.cm)]);
			}
			if (typeof item.dp != 'undefined') {
				datatabledp_prev.push([GetPrevDateFromString(item.d), parseFloat(item.dp)]);
			}
			if (typeof item.ba != 'undefined') {
				datatableba_prev.push([GetPrevDateFromString(item.d), parseFloat(item.ba)]);
			}
			if (typeof item.se != 'undefined') {
				datatablese_prev.push([GetPrevDateFromString(item.d), parseFloat(item.se)]);
			}
			if (typeof item.sm != 'undefined' && typeof item.sx != 'undefined') {
				datatablesm_prev.push([GetPrevDateFromString(item.d), parseFloat(item.sm)]);
				datatablesx_prev.push([GetPrevDateFromString(item.d), parseFloat(item.sx)]);
				datatablesrange_prev.push([GetPrevDateFromString(item.d), parseFloat(item.sm), parseFloat(item.sx)]);
			}
		});
	}

	$.each(data.result, function (i, item) {
		if (isday == 1) {
			if (typeof item.te != 'undefined') {
				datatablete.push([GetUTCFromString(item.d), parseFloat(item.te)]);
			}
			if (typeof item.hu != 'undefined') {
				datatablehu.push([GetUTCFromString(item.d), parseFloat(item.hu)]);
			}
			if (typeof item.ch != 'undefined') {
				datatablech.push([GetUTCFromString(item.d), parseFloat(item.ch)]);
			}
			if (typeof item.dp != 'undefined') {
				datatabledp.push([GetUTCFromString(item.d), parseFloat(item.dp)]);
			}
			if (typeof item.ba != 'undefined') {
				datatableba.push([GetUTCFromString(item.d), parseFloat(item.ba)]);
			}
			if (typeof item.se != 'undefined') {
				datatablese.push([GetUTCFromString(item.d), parseFloat(item.se)]);
			}
		} else {
			if (typeof item.te != 'undefined') {
				datatablete.push([GetDateFromString(item.d), parseFloat(item.te)]);
				datatabletm.push([GetDateFromString(item.d), parseFloat(item.tm)]);
				datatabletrange.push([GetDateFromString(item.d), parseFloat(item.tm), parseFloat(item.te)]);
				if (typeof item.ta != 'undefined') {
					datatableta.push([GetDateFromString(item.d), parseFloat(item.ta)]);
				}
			}
			if (typeof item.hu != 'undefined') {
				datatablehu.push([GetDateFromString(item.d), parseFloat(item.hu)]);
			}
			if (typeof item.ch != 'undefined') {
				datatablech.push([GetDateFromString(item.d), parseFloat(item.ch)]);
				datatablecm.push([GetDateFromString(item.d), parseFloat(item.cm)]);
			}
			if (typeof item.dp != 'undefined') {
				datatabledp.push([GetDateFromString(item.d), parseFloat(item.dp)]);
			}
			if (typeof item.ba != 'undefined') {
				datatableba.push([GetDateFromString(item.d), parseFloat(item.ba)]);
			}
			if (typeof item.se != 'undefined') {
				datatablese.push([GetDateFromString(item.d), parseFloat(item.se)]);//avergae
				datatablesm.push([GetDateFromString(item.d), parseFloat(item.sm)]);//min
				datatablesx.push([GetDateFromString(item.d), parseFloat(item.sx)]);//max
				datatablesrange.push([GetDateFromString(item.d), parseFloat(item.sm), parseFloat(item.sx)]);
			}
		}
	});
	var series;
	if (datatablehu.length != 0) {
		chart.addSeries({
			  id: 'humidity',
			  name: 'Humidity',
			  yAxis: 1,
			  tooltip: {
				  valueSuffix: ' %',
				  valueDecimals: 0
			  }
		}, false);
		series = chart.get('humidity');
		series.setData(datatablehu, false);
	}

	if (datatablech.length != 0) {
		chart.addSeries( {
			  id: 'chill',
			  name: 'Chill',
			  color: 'red',
			  zIndex: 1,
			  tooltip: {
				  valueSuffix: ' \u00B0' + $.myglobals.tempsign,
				  valueDecimals: 1
			  },
			  yAxis: 0
		}, false );
		series = chart.get('chill');
		series.setData(datatablech, false);

		if (isday == 0) {
			chart.addSeries( {
				id: 'chillmin',
				name: 'Chill_min',
				color: 'rgba(255,127,39,0.8)',
				linkedTo: ':previous',
				zIndex: 1,
				tooltip: {
					valueSuffix: ' \u00B0' + $.myglobals.tempsign,
					valueDecimals: 1
				},
				yAxis: 0
			}, false);
			series = chart.get('chillmin');
			series.setData(datatablecm, false);
		}
	}

	if (datatablese.length != 0) {
		if (isday == 1) {
			chart.addSeries( {
				id: 'setpoint',
				name: 'Set Point',
				color: 'blue',
				zIndex: 1,
				tooltip: {
					valueSuffix: ' \u00B0' + $.myglobals.tempsign,
					valueDecimals: 1
				},
				yAxis: 0
			}, false );
			series = chart.get('setpoint');
			series.setData(datatablese, false);
		} else {
			chart.addSeries( {
				id: 'setpointavg',
				name: 'Set Point_avg',
				color: 'blue',
				fillOpacity: 0.7,
				zIndex: 2,
				tooltip: {
					valueSuffix: ' \u00B0' + $.myglobals.tempsign,
					valueDecimals: 1
				},
				yAxis: 0
			}, false);
			series = chart.get('setpointavg');
			series.setData(datatablese,false);

			if (datatablesrange.length != 0) {
				chart.addSeries( {
					id: 'setpointrange',
					name: 'Set Point_range',
					color: 'rgba(164,75,148,1.0)',
					type: 'areasplinerange',
					linkedTo: ':previous',
					zIndex: 1,
					lineWidth: 0,
					fillOpacity: 0.5,
					yAxis: 0,
					tooltip: {
						valueSuffix: ' \u00B0' + $.myglobals.tempsign,
						valueDecimals: 1
					}
				}, false );
				series = chart.get('setpointrange');
				series.setData(datatablesrange, false);
			}
			if (datatablese_prev.length != 0) {
				chart.addSeries( {
					id: 'prev_setpoint',
					name: 'Past Set Point',
					color: 'rgba(223,212,246,0.8)',
					zIndex: 3,
					yAxis: 0,
					tooltip: {
						valueSuffix: ' \u00B0' + $.myglobals.tempsign,
						valueDecimals: 1
					},
					visible: false
				}, false);
				series = chart.get('prev_setpoint');
				series.setData(datatablese_prev, false);
			}
		}
	}

	if (datatablete.length != 0) {
		//Add Temperature series
		if (isday == 1) {
			chart.addSeries( {
				id: 'temperature',
				name: 'Temperature',
				yAxis: 0,
				tooltip: {
					valueSuffix: ' \u00B0' + $.myglobals.tempsign,
					valueDecimals: 1
				}
			}, false );
			series = chart.get('temperature');
			series.setData(datatablete, false);
		} else {
			//Min/Max range
			if (datatableta.length != 0) {
				chart.addSeries( {
					id: 'temperature_avg',
					name: 'Temperature',
					color: 'yellow',
					fillOpacity: 0.7,
					yAxis: 0,
					zIndex: 2,
					tooltip: {
						valueSuffix: ' \u00B0' + $.myglobals.tempsign,
						valueDecimals: 1
					}
				}, false );
				series = chart.get('temperature_avg');
				series.setData(datatableta, false);
				var trandLine = CalculateTrendLine(datatableta);
				if (typeof trandLine != 'undefined') {
					var datatableTrendline = [];
					datatableTrendline.push([trandLine.x0, trandLine.y0]);
					datatableTrendline.push([trandLine.x1, trandLine.y1]);
				}
			}
			if (datatabletrange.length != 0) {
				chart.addSeries( {
					id: 'temperature',
					name: 'Temperature_range',
					color: 'rgba(3,190,252,1.0)',
					type: 'areasplinerange',
					linkedTo: ':previous',
					zIndex: 0,
					lineWidth: 0,
					fillOpacity: 0.5,
					yAxis: 0,
					tooltip: {
						valueSuffix: ' \u00B0' + $.myglobals.tempsign,
						valueDecimals: 1
					}
				}, false );
				series = chart.get('temperature');
				series.setData(datatabletrange, false);
			}
			if (datatableta_prev.length != 0) {
				chart.addSeries( {
					id: 'prev_temperature',
					name: 'Past Temperature',
					color: 'rgba(224,224,230,0.8)',
					zIndex: 3,
					yAxis: 0,
					tooltip: {
						valueSuffix: ' \u00B0' + $.myglobals.tempsign,
						valueDecimals: 1
					},
					visible: false
				}, false);
				series = chart.get('prev_temperature');
				series.setData(datatableta_prev, false);
			}
		}
	}
	if (typeof datatableTrendline != 'undefined') {
		if (datatableTrendline.length > 0) {
			chart.addSeries( {
				id: 'temp_trendline',
				name: 'Trendline Temperature',
				zIndex: 1,
				tooltip: {
					valueSuffix: ' \u00B0' + $.myglobals.tempsign,
					valueDecimals: 1
				},
				color: 'rgba(255,3,3,0.8)',
				dashStyle: 'LongDash',
				yAxis: 0,
				visible: false
			}, false);
			series = chart.get('temp_trendline');
			series.setData(datatableTrendline, false);
		}
	}
	return;
	if (datatabledp.length != 0) {
		chart.addSeries( {
			id: 'dewpoint',
			name: 'Dew Point',
			color: 'blue',
			yAxis: 0,
			tooltip: {
				valueSuffix: ' \u00B0' + $.myglobals.tempsign,
				valueDecimals: 1
			}
		}, false );
		series = chart.get('dewpoint');
		series.setData(datatabledp, false);
	}
	if (datatableba.length != 0) {
		chart.addSeries( {
			id: 'baro',
			name: 'Barometer',
			color: 'pink',
			yAxis: 2,
			tooltip: {
				valueSuffix: ' hPa',
				valueDecimals: 1
			}
		}, false );
		series = chart.get('baro');
		series.setData(datatableba, false);
	}
}

function AddDataToUtilityChart(data, chart, switchtype) {

	var datatableEnergyUsed = [];
	var datatableEnergyGenerated = [];

	var datatableUsage1 = [];
	var datatableUsage2 = [];
	var datatableReturn1 = [];
	var datatableReturn2 = [];
	var datatableTotalUsage = [];
	var datatableTotalReturn = [];

	var datatableUsage1Prev = [];
	var datatableUsage2Prev = [];
	var datatableReturn1Prev = [];
	var datatableReturn2Prev = [];
	var datatableTotalUsagePrev = [];
	var datatableTotalReturnPrev = [];

	var bHaveFloat = false;

	var valueQuantity = "Count";
	if (typeof data.ValueQuantity != 'undefined') {
		valueQuantity = data.ValueQuantity;
	}

	var valueUnits = "";
	if (typeof data.ValueUnits != 'undefined') {
		valueUnits = data.ValueUnits;
	}

	var bHaveDelivered = (typeof data.delivered != 'undefined');
	var bHavePrev = (typeof data.resultprev != 'undefined');

	if (bHavePrev) {
		$.each(data.resultprev, function (i, item) {
			var cdate = GetPrevDateFromString(item.d);
			datatableUsage1Prev.push([cdate, parseFloat(item.v)]);
			if (typeof item.v2 != 'undefined') {
				datatableUsage2Prev.push([cdate, parseFloat(item.v2)]);
			}
			if (bHaveDelivered) {
				datatableReturn1Prev.push([cdate, parseFloat(item.r1)]);
				if (typeof item.r2 != 'undefined') {
					datatableReturn2Prev.push([cdate, parseFloat(item.r2)]);
				}
			}
			if (datatableUsage2Prev.length > 0) {
				datatableTotalUsagePrev.push([cdate, parseFloat(item.v) + parseFloat(item.v2)]);
			}
			else {
				datatableTotalUsagePrev.push([cdate, parseFloat(item.v)]);
			}
			if (datatableUsage2Prev.length > 0) {
				datatableTotalReturnPrev.push([cdate, parseFloat(item.r1) + parseFloat(item.r2)]);
			}
			else {
				if (typeof item.r1 != 'undefined') {
					datatableTotalReturnPrev.push([cdate, parseFloat(item.r1)]);
				}
			}
		});
	}

	$.each(data.result, function (i, item) {
		if (chart == $.DayChart) {
			var cdate = GetUTCFromString(item.d);
			if (typeof item.v != 'undefined') {
				if (switchtype != 2) {
					var fValue=parseFloat(item.v);
					if (fValue % 1 != 0)
						bHaveFloat=true;
					datatableUsage1.push([cdate, fValue]);
				}
				else {
					datatableUsage1.push([cdate, parseFloat(item.v) * $.DividerWater]);
				}
			}
			if (typeof item.v2 != 'undefined') {
				datatableUsage2.push([cdate, parseFloat(item.v2)]);
			}
			if (bHaveDelivered) {
				datatableReturn1.push([cdate, parseFloat(item.r1)]);
				if (typeof item.r2 != 'undefined') {
					datatableReturn2.push([cdate, parseFloat(item.r2)]);
				}
			}
			if (typeof item.eu != 'undefined') {
				datatableEnergyUsed.push([cdate, parseFloat(item.eu)]);
			}
			if (typeof item.eg != 'undefined') {
				datatableEnergyGenerated.push([cdate, parseFloat(item.eg)]);
			}
		}
		else {
			var cdate = GetDateFromString(item.d);
			if (switchtype != 2) {
				datatableUsage1.push([cdate, parseFloat(item.v)]);
			}
			else {
				datatableUsage1.push([cdate, parseFloat(item.v) * $.DividerWater]);
			}
			if (typeof item.v2 != 'undefined') {
				datatableUsage2.push([cdate, parseFloat(item.v2)]);
			}
			if (bHaveDelivered) {
				datatableReturn1.push([cdate, parseFloat(item.r1)]);
				if (typeof item.r2 != 'undefined') {
					datatableReturn2.push([cdate, parseFloat(item.r2)]);
				}
			}
			if (datatableUsage2.length > 0) {
				datatableTotalUsage.push([cdate, parseFloat(item.v) + parseFloat(item.v2)]);
			}
			else {
				datatableTotalUsage.push([cdate, parseFloat(item.v)]);
			}
			if (datatableUsage2.length > 0) {
				datatableTotalReturn.push([cdate, parseFloat(item.r1) + parseFloat(item.r2)]);
			}
			else {
				if (typeof item.r1 != 'undefined') {
					datatableTotalReturn.push([cdate, parseFloat(item.r1)]);
				}
			}
		}
	});

	var series;
	if ((switchtype == 0) || (switchtype == 4)) {

		//Electra Usage/Return
		if ((chart == $.DayChart) || (chart == $.WeekChart)) {
			var totDecimals = 3;
			if (chart == $.DayChart) {
				if (bHaveFloat == true) {
					totDecimals = 1;
				}
				else {
					totDecimals = 0;
				}
			}
			if (datatableEnergyUsed.length > 0) {
				if (datatableUsage2.length == 0) {
					// instant + counter type
					chart.highcharts().addSeries({
						id: 'eUsed',
						type: 'column',
						pointRange: 3600 * 1000, // 1 hour in ms
						zIndex: 5,
						animation: false,
						name: ( switchtype == 0 ) ? 'Energy Usage' : 'Energy Generated',
						tooltip: {
							valueSuffix: ( chart == $.WeekChart ) ? ' kWh' : ' Wh',
							valueDecimals: totDecimals
						},
						color: 'rgba(3,190,252,0.8)',
						yAxis: 0,
						visible: datatableUsage2.length == 0
					}, false)
				} else {
					// p1 type
					chart.highcharts().addSeries({
						id: 'eUsed',
						type: 'area',
						name: 'Energy Usage',
						tooltip: {
							valueSuffix: ( chart == $.WeekChart ) ? ' kWh' : ' Wh',
							valueDecimals: totDecimals
						},
						color: 'rgba(120,150,220,0.9)',
						fillOpacity: 0.2,
						yAxis: 0,
						visible: datatableUsage2.length == 0
					}, false);
				}
				series = chart.highcharts().get('eUsed');
				series.setData(datatableEnergyUsed, false);
			}
			if (datatableEnergyGenerated.length > 0) {
				// p1 type
				chart.highcharts().addSeries({
					id: 'eGen',
					type: 'area',
					name: 'Energy Returned',
					tooltip: {
						valueSuffix: ( chart == $.WeekChart ) ? ' kWh' : ' Wh',
						valueDecimals: totDecimals
					},
					color: 'rgba(120,220,150,0.9)',
					fillOpacity: 0.2,
					yAxis: 0,
					visible: false
				}, false);
				series = chart.highcharts().get('eGen');
				series.setData(datatableEnergyGenerated, false);
			}
			if (datatableUsage1.length > 0) {
				if (datatableUsage2.length == 0) {
					if ( datatableEnergyUsed.length == 0 ) {
						// counter type (no power)
						chart.highcharts().addSeries({
							id: 'usage1',
							name: ( switchtype == 0 ) ? 'Energy Usage' : 'Energy Generated',
							tooltip: {
								valueSuffix: ( chart == $.DayChart ) ? ' Wh' : ' kWh',
								valueDecimals: totDecimals
							},
							color: 'rgba(3,190,252,0.8)',
							stack: 'susage',
							yAxis: 0
						}, false);
					} else {
						// instant + counter type
						chart.highcharts().addSeries({
							id: 'usage1',
							name: ( switchtype == 0 ) ? 'Power Usage' : 'Power Generated',
							zIndex: 10,
							type: ( chart == $.DayChart ) ? 'spline' : 'column', // power vs energy
							tooltip: {
								valueSuffix: ( chart == $.DayChart ) ? ' Watt' : ' kWh',
								valueDecimals: totDecimals
							},
							color: ( chart == $.DayChart ) ? 'rgba(255,255,0,0.8)' : 'rgba(3,190,252,0.8)', // yellow vs blue
							stack: 'susage',
							yAxis: ( chart == $.DayChart && chart.highcharts().yAxis.length > 1 ) ? 1 : 0
						}, false);
					}
				} else {
					// p1 type
					chart.highcharts().addSeries({
						id: 'usage1',
						name: 'Usage' + ' 1',
						tooltip: {
							valueSuffix: (chart == $.WeekChart) ? ' kWh' : ' Watt',
							valueDecimals: totDecimals
						},
						color: 'rgba(60,130,252,0.8)',
						stack: 'susage',
						yAxis: (chart == $.WeekChart) ? 0 : 1
					}, false);
				}
				series = chart.highcharts().get('usage1');
				series.setData(datatableUsage1, false);
			}
			if (datatableUsage2.length > 0) {
				// p1 type
				chart.highcharts().addSeries({
					id: 'usage2',
					name: 'Usage' + ' 2',
					tooltip: {
						valueSuffix: (chart == $.WeekChart) ? ' kWh' : ' Watt',
						valueDecimals: totDecimals
					},
					color: 'rgba(3,190,252,0.8)',
					stack: 'susage',
					yAxis: (chart == $.WeekChart) ? 0 : 1
				}, false);
				series = chart.highcharts().get('usage2');
				series.setData(datatableUsage2, false);
			}
			if (bHaveDelivered) {
				if (datatableReturn1.length > 0) {
					chart.highcharts().addSeries({
						id: 'return1',
						name: 'Return1',
						tooltip: {
							valueSuffix: (chart == $.WeekChart) ? ' kWh' : ' Watt',
							valueDecimals: totDecimals
						},
						color: 'rgba(30,242,110,0.8)',
						stack: 'sreturn',
						yAxis: (chart == $.WeekChart) ? 0 : 1
					}, false);
					series = chart.highcharts().get('return1');
					series.setData(datatableReturn1, false);
				}
				if (datatableReturn2.length > 0) {
					chart.highcharts().addSeries({
						id: 'return2',
						name: 'Return 2',
						tooltip: {
							valueSuffix: (chart == $.WeekChart) ? ' kWh' : ' Watt',
							valueDecimals: totDecimals
						},
						color: 'rgba(3,252,190,0.8)',
						stack: 'sreturn',
						yAxis: (chart == $.WeekChart) ? 0 : 1
					}, false);
					series = chart.highcharts().get('return2');
					series.setData(datatableReturn2, false);
				}
			}
		}
		else {
			//month/year, show total for now
			if (datatableTotalUsage.length > 0) {
				chart.highcharts().addSeries({
					id: 'usage',
					name: (switchtype == 0) ? 'Total Usage' : ( ( switchtype == 4 ) ? 'Total Generated' : 'Total Return' ),
					zIndex: 2,
					tooltip: {
						valueSuffix: ' kWh',
						valueDecimals: 3
					},
					color: 'rgba(3,190,252,0.8)',
					yAxis: 0
				}, false);
				series = chart.highcharts().get('usage');
				series.setData(datatableTotalUsage, false);
				var trandLine = CalculateTrendLine(datatableTotalUsage);
				if (typeof trandLine != 'undefined') {
					var datatableTrendlineUsage = [];

					datatableTrendlineUsage.push([trandLine.x0, trandLine.y0]);
					datatableTrendlineUsage.push([trandLine.x1, trandLine.y1]);

					chart.highcharts().addSeries({
						id: 'usage_trendline',
						name: 'Trendline' + ' ' +  ( ( switchtype == 0 ) ? 'Usage' : ( ( switchtype == 4 ) ? 'Generated' : 'Return' ) ),
						zIndex: 1,
						tooltip: {
							valueSuffix: ' kWh',
							valueDecimals: 3
						},
						color: 'rgba(252,3,3,0.8)',
						dashStyle: 'LongDash',
						yAxis: 0,
						visible: false
					}, false);
					series = chart.highcharts().get('usage_trendline');
					series.setData(datatableTrendlineUsage, false);
				}
			}
			if (bHaveDelivered) {
				if (datatableTotalReturn.length > 0) {
					chart.highcharts().addSeries({
						id: 'return',
						name: 'Total Return',
						zIndex: 1,
						tooltip: {
							valueSuffix: ' kWh',
							valueDecimals: 3
						},
						color: 'rgba(3,252,190,0.8)',
						yAxis: 0
					}, false);
					series = chart.highcharts().get('return');
					series.setData(datatableTotalReturn, false);
					var trandLine = CalculateTrendLine(datatableTotalReturn);
					if (typeof trandLine != 'undefined') {
						var datatableTrendlineReturn = [];

						datatableTrendlineReturn.push([trandLine.x0, trandLine.y0]);
						datatableTrendlineReturn.push([trandLine.x1, trandLine.y1]);

						chart.highcharts().addSeries({
							id: 'return_trendline',
							name: 'Trendline Return',
							zIndex: 1,
							tooltip: {
								valueSuffix: ' kWh',
								valueDecimals: 3
							},
							color: 'rgba(255,127,39,0.8)',
							dashStyle: 'LongDash',
							yAxis: 0,
							visible: false
						}, false);
						series = chart.highcharts().get('return_trendline');
						series.setData(datatableTrendlineReturn, false);
					}
				}
			}
			if (datatableTotalUsagePrev.length > 0) {
				chart.highcharts().addSeries({
					id: 'usageprev',
					name: $.t('Past') + ' ' + ( ( switchtype == 0 ) ? 'Usage' : ( ( switchtype == 4 ) ? 'Generated' : 'Return' ) ),
					tooltip: {
						valueSuffix: ' kWh',
						valueDecimals: 3
					},
					color: 'rgba(190,3,252,0.8)',
					yAxis: 0,
					visible: false
				}, false);
				series = chart.highcharts().get('usageprev');
				series.setData(datatableTotalUsagePrev, false);
			}
			if (bHaveDelivered) {
				if (datatableTotalReturnPrev.length > 0) {
					chart.highcharts().addSeries({
						id: 'returnprev',
						name: 'Past' + ' ' + 'Return',
						tooltip: {
							valueSuffix: ' kWh',
							valueDecimals: 3
						},
						color: 'rgba(252,190,3,0.8)',
						yAxis: 0,
						visible: false
					}, false);
					series = chart.highcharts().get('returnprev');
					series.setData(datatableTotalReturnPrev, false);
				}
			}
		}
	}
	else if (switchtype == 1) {
		//gas
		chart.highcharts().addSeries({
			id: 'gas',
			name: 'Gas',
			zIndex: 2,
			tooltip: {
				valueSuffix: ' m3',
				valueDecimals: 3
			},
			color: 'rgba(3,190,252,0.8)',
			yAxis: 0
		}, false);
		if ((chart == $.MonthChart) || (chart == $.YearChart)) {
			var trandLine = CalculateTrendLine(datatableUsage1);
			if (typeof trandLine != 'undefined') {
				var datatableTrendlineUsage = [];

				datatableTrendlineUsage.push([trandLine.x0, trandLine.y0]);
				datatableTrendlineUsage.push([trandLine.x1, trandLine.y1]);

				chart.highcharts().addSeries({
					id: 'usage_trendline',
					name: 'Trendline ' + 'Gas',
					zIndex: 1,
					tooltip: {
						valueSuffix: ' m3',
						valueDecimals: 3
					},
					color: 'rgba(252,3,3,0.8)',
					dashStyle: 'LongDash',
					yAxis: 0,
					visible: false
				}, false);
				series = chart.highcharts().get('usage_trendline');
				series.setData(datatableTrendlineUsage, false);
			}
			if (datatableUsage1Prev.length > 0) {
				chart.highcharts().addSeries({
					id: 'gasprev',
					name: 'Past' + ' ' + 'Gas',
					tooltip: {
						valueSuffix: ' m3',
						valueDecimals: 3
					},
					color: 'rgba(190,3,252,0.8)',
					yAxis: 0,
					visible: false
				}, false);
				series = chart.highcharts().get('gasprev');
				series.setData(datatableUsage1Prev, false);
			}
		}
		series = chart.highcharts().get('gas');
		series.setData(datatableUsage1, false);
		chart.highcharts().yAxis[0].options.title.text = 'Gas m3';
	}
	else if (switchtype == 2) {
		//water
		chart.highcharts().addSeries({
			id: 'water',
			name: 'Water',
			tooltip: {
				valueSuffix: ' Liter',
				valueDecimals: 0
			},
			color: 'rgba(3,190,252,0.8)',
			yAxis: 0
		}, false);
		chart.highcharts().yAxis[0].options.title.text = 'Water Liter';
		series = chart.highcharts().get('water');
		series.setData(datatableUsage1, false);
	}
	else if (switchtype == 3) {
		//counter
		chart.highcharts().addSeries({
			id: 'counter',
			name: valueQuantity,
			tooltip: {
				valueSuffix: ' ' + valueUnits,
				valueDecimals: 0
			},
			color: 'rgba(3,190,252,0.8)',
			yAxis: 0
		}, false);
		chart.highcharts().yAxis[0].options.title.text = valueQuantity + ' ' + valueUnits;
		series = chart.highcharts().get('counter');
		series.setData(datatableUsage1, false);
	}
}

function GetUTCFromString(s) {
	return Date.UTC(
	  parseInt(s.substring(0, 4), 10),
	  parseInt(s.substring(5, 7), 10) - 1,
	  parseInt(s.substring(8, 10), 10),
	  parseInt(s.substring(11, 13), 10),
	  parseInt(s.substring(14, 16), 10),
	  0
	);
}

function GetDateFromString(s) {
	return Date.UTC(
	  parseInt(s.substring(0, 4), 10),
	  parseInt(s.substring(5, 7), 10) - 1,
	  parseInt(s.substring(8, 10), 10));
}

function GetPrevDateFromString(s) {
	return Date.UTC(
	  parseInt(s.substring(0, 4), 10) + 1,
	  parseInt(s.substring(5, 7), 10) - 1,
	  parseInt(s.substring(8, 10), 10));
}

function CalculateTrendLine(data) {
	//function taken from jquery.flot.trendline.js
	var ii = 0, x, y, x0, x1, y0, y1, dx,
		m = 0, b = 0, cs, ns,
		n = data.length, Sx = 0, Sy = 0, Sxy = 0, Sx2 = 0, S2x = 0;

	// Not enough data
	if (n < 2) return;

	// Do math stuff
	for (ii; ii < data.length; ii++) {
		x = data[ii][0];
		y = data[ii][1];
		Sx += x;
		Sy += y;
		Sxy += (x * y);
		Sx2 += (x * x);
	}
	// Calculate slope and intercept
	m = (n * Sx2 - S2x) != 0 ? (n * Sxy - Sx * Sy) / (n * Sx2 - Sx * Sx) : 0;
	b = (Sy - m * Sx) / n;

	// Calculate minimal coordinates to draw the trendline
	dx = 0;// parseFloat(data[1][0]) - parseFloat(data[0][0]);
	x0 = parseFloat(data[0][0]) - dx;
	y0 = parseFloat(m * x0 + b);
	x1 = parseFloat(data[ii - 1][0]) + dx;
	y1 = parseFloat(m * x1 + b);

	var dReturn = {};
	dReturn.x0 = x0;
	dReturn.y0 = y0;
	dReturn.x1 = x1;
	dReturn.y1 = y1;
	return dReturn;
};

function GetGraphUnit(uname)
{
	if (uname == 'Usage')
		return 'kWh';
	if (uname == 'Usage' + ' 1')
		return 'kWh';
	if (uname == 'Usage' + ' 2')
		return 'kWh';
	if (uname == 'Return' + ' 1')
		return 'kWh';
	if (uname == 'Return' + ' 2')
		return 'kWh';
	if (uname == 'Gas')
		return 'm3';
	if (uname == 'Past' + ' ' + 'Gas')
		return 'm3';
	if (uname == 'Water')
		return 'm3';
	if (uname == 'Power')
		return 'Watt';
	if (uname == 'Total Usage')
		return 'kWh';
	if (uname == 'Past' + ' '  + 'Usage')
		return 'kWh';
	if (uname == 'Past' + ' ' + 'Return')
		return 'kWh';
	if (uname == 'Return')
		return 'kWh';
	if (uname == 'Generated')
		return 'kWh';

	return '?';
}
