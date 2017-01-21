// Function to request the Domoboard API
function requestAPI(url, callback) {
  $.ajax({
    type: 'POST',
    url: url,
    data: { _csrf_token: csrf_token },
    success:  function (data) {
			if (typeof callback === "function"){
			callback(data);
			}
    },
    async:true
  });
}

// Switch functions
function changeSwitch(checkboxElem, idx) {
  if (checkboxElem.checked) {
    requestAPI(flask_server + "/api?type=command&param=switchlight&idx=" + idx + "&switchcmd=On" );
  } else {
    requestAPI(flask_server + "/api?type=command&param=switchlight&idx=" + idx + "&switchcmd=Off"  );
  }
}
// Dimmer functions
function changeDimmer(checkboxElem, idx) {
  var chkurl = "/api?type=devices&rid=" + idx;
  requestAPI(flask_server + chkurl, function(d) {
    _json = JSON.parse(d);
    if (_json['result'][0]['Data'] != 'Off') {
      requestAPI(flask_server + "/api?type=command&param=switchlight&idx=" + idx + "&switchcmd=Off&level=0");
    } else {
      requestAPI(flask_server + "/api?type=command&param=switchlight&idx=" + idx + "&switchcmd=On&level=0");
    }
    setDimmerState(checkboxElem, idx);
  });
}

function setDimmerState(id, idx) {
  var url = "/api?type=devices&rid=" + idx;
  requestAPI(flask_server + url, function(d) {
    _json = JSON.parse(d);
    if (_json['result'][0]['Data'] != 'Off') {
      $('#' + id).css({'background-image': '-webkit-linear-gradient(top, #f9f9f9 0%, green 100%)', 'background-image': '-o-linear-gradient(top, #f9f9f9 0%, green 100%)', 'background-image': 'linear-gradient(to bottom, #f9f9f9 0%, green 100%)'});
    } else {
      $('#' + id).css({'background-image': '-webkit-linear-gradient(top, #f9f9f9 0%, #f5f5f5 100%)', 'background-image': '-o-linear-gradient(top, #f9f9f9 0%, #f5f5f5 100%)', 'background-image': 'linear-gradient(to bottom, #f9f9f9 0%, #f5f5f5 100%)'});
    }
  });
}

// Switch functions
function changePush(idx, action) {
  if (action == 'on') {
    requestAPI(flask_server + "/api?type=command&param=switchlight&idx=" + idx + "&switchcmd=On" );
  } else {
    requestAPI(flask_server + "/api?type=command&param=switchlight&idx=" + idx + "&switchcmd=Off"  );
  }
}

function changeScene(idx, action) {
  if (action == 'on') {
    requestAPI(flask_server + "/api?type=command&param=switchscene&idx=" + idx + "&switchcmd=On" );
  } else {
    requestAPI(flask_server + "/api?type=command&param=switchscene&idx=" + idx + "&switchcmd=Off"  );
  }
}

function refreshSwitches(updateSwitches, block) {
  $.each(updateSwitches, function (i, switchID) {
    var url = flask_server + "/api?type=devices&rid=" + switchID;
    var clickCheckbox = document.getElementById("switch_" + switchID + "_block_" + block);
    $('input[id="'+ "switch_" + switchID + "_block_" + block + '"]').bootstrapSwitch();
    var val = $('input[id="'+ "switch_" + switchID + "_block_" + block + '"]').bootstrapSwitch('state');
    requestAPI(url, function(d){
		var data = JSON.parse(d);
		if ((val == false) && (data.result[0].Data != "Off")) {
        $('input[id="'+ "switch_" + switchID + "_block_" + block + '"]').bootstrapSwitch('state', true, true);
      } else if ((val == true) && (data.result[0].Data == "Off")) {
        $('input[id="'+ "switch_" + switchID + "_block_" + block + '"]').bootstrapSwitch('state', false, true);
      }
	   });
  });
}

// Top tiles functions
function refreshTopTiles(updateDivs, block, tilesPreviousArray, updateDivsTypeArray, updateDivsUnitsArray) {
  if (tilesPreviousArray.length == 0) {
    for(var i = 0; i < updateDivs.length; i++){
      tilesPreviousArray.push(-1);
    }
  }
  var i = 0;
  $.each(updateDivs, function (i, divID) {
    var url = flask_server + "/api?type=devices&rid=" + divID;
    requestAPI(url, function(d) {
		var obj = JSON.parse(d);
		if (obj.result != undefined) {
			var data = obj.result[0][updateDivsTypeArray[i]].toString();
		} else {
			var data = "-";
		}
		//var re = /(-?\d+\.?\d*) (.+)/;  -- old regex didn't found an temp value
    var re = /(-?\d+[\.*]?\d*)(\s*.*)/;
		tilesArray = re.exec(data);

		if (tilesArray != null) {
      if (updateDivsUnitsArray[i]) {
        tilesArray[2] = updateDivsUnitsArray[i];
      }
			if (parseFloat(tilesArray[1]) < parseFloat(tilesPreviousArray[i])) {
				$("#" + block + divID + "_" + updateDivsTypeArray[i]).html(tilesArray[1] + "<font size=2vw>" + tilesArray[2] + "</font>");
        $("#" + block + divID + "_" + updateDivsTypeArray[i] + "_arrow").removeClass("green");
        $("#" + block + divID + "_" + updateDivsTypeArray[i] + "_arrow").addClass("red");
        $("#" + block + divID + "_" + updateDivsTypeArray[i] + "_arrow").removeClass("fa-caret-up");
        $("#" + block + divID + "_" + updateDivsTypeArray[i] + "_arrow").addClass("fa-caret-down");
				tilesPreviousArray[i] = tilesArray[1];
			} else if (parseFloat(tilesArray[1]) > parseFloat(tilesPreviousArray[i])) {
				$("#" + block + divID  + "_" + updateDivsTypeArray[i]).html(tilesArray[1] + "<font size=2vw>" + tilesArray[2] + "</font>");
        $("#" + block + divID + "_" + updateDivsTypeArray[i] + "_arrow").removeClass("red");
        $("#" + block + divID + "_" + updateDivsTypeArray[i] + "_arrow").addClass("green");
        $("#" + block + divID + "_" + updateDivsTypeArray[i] + "_arrow").removeClass("fa-caret-down");
        $("#" + block + divID + "_" + updateDivsTypeArray[i] + "_arrow").addClass("fa-caret-up");
				tilesPreviousArray[i] = tilesArray[1];
			} else {
        $("#" + block + divID + "_" + updateDivsTypeArray[i]).html(tilesArray[1] + "<font size=2vw>" + tilesArray[2] + "</font>");
      }
		} else {
			$("#" + block + divID + "_" + updateDivsTypeArray[i]).html(data);
		}
		if(data == "On") {
			$("#" + block + divID + "_" + updateDivsTypeArray[i]).removeClass("red");
			$("#" + block + divID + "_" + updateDivsTypeArray[i]).addClass("green");
		} else if(data == "Off") {
			$("#" + block + divID + "_" + updateDivsTypeArray[i]).removeClass("green");
			$("#" + block + divID + "_" + updateDivsTypeArray[i]).addClass("red");
		} else {
			$("#" + block + divID + "_" + updateDivsTypeArray[i]).removeClass("green");
			$("#" + block + divID + "_" + updateDivsTypeArray[i]).removeClass("red");
		}
	});
    i = i++;
  });
  return tilesPreviousArray;
}

// Power usage functions
function refreshPowerUsage(updatePowerUsage, block) {
  var calcTotalArray = [];
  var total = 0;
  $.each(updatePowerUsage, function(i, powerUsageID) {
    var url = flask_server + "/api?type=devices&rid=" + powerUsageID;
    requestAPI(url, function(d){
		var obj = JSON.parse(d);
		$("#power_usage_" + powerUsageID + "_" + block).html(obj.result[0].Data);
		calcTotalArray.push(obj.result[0].Data.replace(" kWh", ""));
		$.each(calcTotalArray,function(){total+=parseFloat(this) || 0; });
		$("#" + "power_usage_total_" + block).html("<b>" + total.toFixed(3) + " kWh</b>");
	});
  });
}


// Map functions
function refreshMapLocation(idx, iframe) {
  var iframe = $('#' + iframe);
  var url = flask_server + "/api?type=devices&rid=" + idx;
  requestAPI(url, function(d) {
	var data = JSON.parse(d);
	var locurl = "https://www.google.com/maps/embed/v1/place?key=" + googleMapEmbedKey + "&q=" + encodeURIComponent(data.result[0].Data) + "&maptype=satellite";
	iframe.attr('src',locurl);
  });

}

// Dimmers functions
function dimmerSlider(updateDimmers, block) {
  $.each(updateDimmers, function(i, dimmerID) {
    url = "/api?type=devices&rid=" + dimmerID;
    requestAPI(url, function(d) {
  		var percentage = JSON.parse(d).result[0].Level;
  		$('#dimmer_' + dimmerID + "_block_" + block).slider({min:0, max:100, value: percentage}).on('slideStop', function(ev) {
        setDimmerState('dim_' + dimmerID + "_block_" + block + "_track", dimmerID);
        changeDimmerSlider($(this).attr('id'), ev.value)
      } ).data('slider');
      setDimmerState('dim_' + dimmerID + "_block_" + block + "_track", dimmerID);
     });
  });
}

function setpointSlider(updateSetpoints, block) {
  $.each(updateSetpoints, function(i, setpoint) {
    url = "/api?type=devices&rid=" + setpoint[0];
    requestAPI(url, function(d) {
  		var percentage = parseFloat(JSON.parse(d).result[0].Data);
  		$('#setpoint_slider' + setpoint[0] + "_block_" + block).slider({min:parseInt(setpoint[1]), max:parseInt(setpoint[2]), value: parseFloat(percentage)}).on('slideStop', function(ev) {
        changeSetpoint(setpoint[0], parseFloat(ev.value));
      } ).data('slider');
      $('#stpnt_' + setpoint[0] + "_block_" + block + '_track').css({'background-image': '-webkit-linear-gradient(top, #f9f9f9 0%, red 100%)', 'background-image': '-o-linear-gradient(top, #f9f9f9 0%, red 100%)', 'background-image': 'linear-gradient(to bottom, #f9f9f9 0%, red 100%)'});
     });
  });
}

function changeDimmerSlider(idx, value) {
  var re = /dimmer_(\d+)_block_\d+/;
  match = re.exec(idx);
  ridx = match[1];
  requestAPI(flask_server + "/api?type=command&param=switchlight&idx=" + ridx + "&switchcmd=Set%20Level&level=" + value);
}

// RGB functions
function changeRgbColor(idx) {
  var re = /rgb_(\d+)_block_\d+/;
  match = re.exec(idx);
  ridx = match[1];
  var rgb = $("#" + idx).data('colorpicker').color;
  var rgbcode = rgb.toHex();
  var rgbcode_stripped = rgbcode.substring(1);
  requestAPI(flask_server + "/api?type=command&param=setcolbrightnessvalue&idx=" + ridx + "&hex=" + rgbcode_stripped);
}

// Chart functions
function redrawLineChart(sensor, idx, range, block) {
  var url = "/api?type=graph&sensor=" + sensor + "&idx=" + idx + "&range=" + range;
  requestAPI(url, function(d){
  block.setData(JSON.parse(d).result);
  });
}

function redrawBarChart(idxs, block, barChartElementsNames) {
  var url = "/api?custom=bar_chart&idxs=" + idxs.join();
  var i = 0;
  requestAPI(url, function(d){
	  var data = JSON.parse(d);
    for (var key in data) {
      data[key]["l"] = barChartElementsNames[i];
      i++;
    }
  block.setData(data);
  });
}

function redrawDonutChart(idxs, block) {
  var url = "/api?custom=donut_chart&idxs=" + idxs.join();
  requestAPI(url, function(d){
	block.setData(JSON.parse(d));
  });
}

function redrawAreaChart(sensor, idx, range, block) {
  var url = "/api?type=graph&sensor=" + sensor + "&idx=" + idx + "&range=" + range;
  requestAPI(url, function(d) {
  block.setData(JSON.parse(d).result);
  });
}

// Log functions
function RefreshLogData() {
  clearInterval($.refreshTimerGraph);
  var url = flask_server + "/api?type=command&param=getlog";
  requestAPI((url), function(d) {
	var data = JSON.parse(d);
	var arrData = [];
  $.each(data.result, function(i, item) {
    var x = [item['level'], item['message']];
    arrData.push(x);
  });

  var filter = document.getElementById('filterlog').value;
  var text = "";

  for (i = (arrData.length - 1); i > 0; i--) {
    var totalText = arrData[i][1];
    var lowerText = totalText.toLowerCase();
    if (filter.length <= 0 || lowerText.indexOf(filter.toLowerCase()) >= 0) {
        var res = totalText.split(" ");
        text += "<font color='#8bc34a' style='padding-right:10px'>" + res[0] + "  " + res[1] + "  </font>";
        totalText = totalText.replace(res[0] + " " + res[1], "")
        .replace("User:", "<font color='#81d4fa'>User: </font>")
        .replace("LUA:", "<font color='#fff176'>LUA: </font>")
        .replace("Hardware Monitor", "<font color='#ffa726'>Hardware Monitor: </font>")
        .replace("Error:", "<font color='red'>Error: </font>")
        .replace("EventSystem", "<font color='#ffa726'>EventSystem: </font>")

        text += totalText;
        text += "<br>";
      }
    }
  $('#showlog').html(text);
  });
  $.refreshTimerGraph = setInterval(RefreshLogData, 2000);
}

// Settings functions
function retrieveAvailableDevices() {
  var url = flask_server + "/api?type=devices&filter=all&used=true&order=Name";
 requestAPI(url, function(d){
	var data = JSON.parse(d);
	var arrData = [];
	$.each(data.result, function(i, item) {
      var x = [item['idx'], item['Name']];
      arrData.push(x);
    });
    var text = '<table class="table"><thead><tr><th>Idx</th><th>Name</th><th>Displayed on</th><th>Add</th></tr>';
    for (i = (arrData.length - 1); i > 0; i--) {
      text += '<tr>';
      var name = arrData[i][1];
      var idx = arrData[i][0];
      text += "<td>" + idx + "</td><td>" +  name + '</td><td></td><td><button id=' + idx + ' type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#myModal" onClick="modifyConfigButtonClicked(this.id)">Add</button></td></p>';
      text += '</tr>';
    }
    text += '</tbody></table>';
    $('#showdevices').html(text);
 });

}

function selected_page_settings() {
  $("#dropdownMenu2").on("click", "li a", function() {
    var page = $(this).text() + ' <span class="caret"></span>';
    $("#selected_page").html(page);
  });
}

function selected_component_settings() {
  $("#dropdownMenu1").on("click", "li a", function() {
    var component = $(this).text() + ' <span class="caret"></span>';
    $("#selected_component").html(component);
  });
}

// Config modification functions
function modifyConfig() {
  var url = "/api?custom=" + document.forms["modifyConfigForm"]["custom"].value + "&idx=" + document.forms["modifyConfigForm"]["idx"].value + "&description=" + document.forms["modifyConfigForm"]["description"].value + "&page=" + $("#dropDownPage option:selected").text() + "&component=" + $("#dropDownComponent option:selected").text() + "&extra=" + $("#dropDownExtra option:selected").text();
  var data = JSON.parse(requestAPI(url));
}

function modifyConfigButtonClicked(id) {
  $('input[name="idx"]').val(id);
}

// Setpoint functions
function changeSetpoint(idx, val) {
  requestAPI(flask_server + "/api?type=command&param=setsetpoint&idx=" + idx + "&setpoint=" + val);
}

function refreshSetpoints(updateSetpoints, block) {
  $.each(updateSetpoints, function(i, setpointID) {
    var url = flask_server + "/api?type=devices&rid="+ setpointID;
    var setpointVal = document.getElementById("setpoint_" + setpointID + "_block_" + block);
    requestAPI(url, function(d) {
			var data = JSON.parse(d);
			setpointVal.innerHTML = data.result[0].SetPoint;
	   });
  })
}

function newValueUp(last_val) {
    last_val = last_val.split('.');
    if (last_val[1] == '5') {
        last_val[0] = parseInt(last_val[0]) + 1;
        last_val[1] = '0'
    } else {
        last_val[1] = '5'
    }
    return last_val[0] + '.' + last_val[1]
}
function newValueDown(last_val) {
    last_val = last_val.split('.');
    if (last_val[1] == '5') {
        last_val[1] = '0'
    } else {
        last_val[0] = parseInt(last_val[0]) - 1;
        last_val[1] = '5'
    }
    return last_val[0] + '.' + last_val[1]
}

var changeTimer = null;
function changeUp(idx, block) {
    var el = document.getElementById("setpoint_" + idx + "_block_" + block).innerHTML;
    var newVal = newValueUp(el);
    document.getElementById("setpoint_" + idx + "_block_" + block).innerHTML = newVal;
    if(changeTimer != null) {
        clearTimeout(changeTimer);
    }

    changeTimer = setTimeout(function () {
        changeSetpoint(idx, newVal);
    }, 400);
}

function changeDown(idx, block) {
    var el = document.getElementById("setpoint_" + idx + "_block_" + block).innerHTML;
    var newVal = newValueDown(el);
    document.getElementById("setpoint_" + idx + "_block_" + block).innerHTML = newVal;
    if(changeTimer != null) {
        clearTimeout(changeTimer);
    }
    changeTimer = setTimeout(function () {
        changeSetpoint(idx, newVal);
    }, 400);
}

// Update functions
function performUpgrade() {
  requestAPI('/api?custom=performUpgrade');
  $( "#version_div" ).removeClass("show_update");
  $( "#version_div" ).addClass("hide_update");
  $( "#updateView_available" ).removeClass("show_update");
  $( "#updateView_available" ).addClass("hide_update");
  $( "#updateView_not_available" ).removeClass("hide_update");
  $( "#updateView_not_available" ).addClass("show_update");
}

function checkVersion(branch) {
  $.ajax({
    url: "https://domoboard.nl/version.md",
    cache: false,
    success: function( data ) {
      if (branch == "master") {
        dataFloat = parseFloat(data.split(","[0]));
      } else {
        dataFloat = parseFloat(data.split(","[1]));
      }
    versionFloat = parseFloat(version);
    if (dataFloat > versionFloat) {
      document.getElementById('curver').innerHTML = version;
      document.getElementById('newver').innerHTML = data;
      $( "#version_div" ).removeClass("hide_update");
      $( "#version_div" ).addClass("show_update");
      }
    },
    async:true
    });
  }

function checkVersionSettings(branch) {
  $.ajax({
    url: "https://domoboard.nl/version.md",
    cache: false,
    success: function( data ) {
      if (branch == "master") {
        dataFloat = parseFloat(data.split(","[0]));
      } else {
        dataFloat = parseFloat(data.split(","[1]));
      }    versionFloat = parseFloat(version);
      if (dataFloat > versionFloat) {
        $( "#updateView_available" ).removeClass("hide_update");
        $( "#updateView_available" ).addClass("show_update");
        document.getElementById('curver_settings').innerHTML = version;
        document.getElementById('newver_settings').innerHTML = data;
      } else {
        $( "#updateView_not_available" ).removeClass("hide_update");
        $( "#updateView_not_available" ).addClass("show_update");
      }
    },
    async:true
    });
  }
