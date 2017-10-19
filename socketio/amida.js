var exports = module.exports = {};

var express = require('express');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var fs = require('fs');

var storedCMS = require('./sample.json');



var app = express();
app.use(bodyParser());
app.use(fileUpload());

var staticDir = '/var/www/static'
app.use(express.static(staticDir));

function getField(name, dataIn) 
{
	//find the datapoint of name contained in the raw data dataIn
	var startIdx = dataIn.indexOf(name+': ');
	startIdx+= name.length+2; //record data after the substring "name: "
	var endIdx = dataIn.substring(startIdx).indexOf('\n') + startIdx; //find end of line
	if(startIdx==-1 || endIdx==-1 || startIdx > endIdx)
	{
		throw "error- Input data not formatted correctly for field: " + name;
	}
	return dataIn.substring(startIdx, endIdx);
}

function getLastName(fullName)
{
	var ret = '';
	for(var idx in fullName.split(' '))
	{
		if(idx > 0) 
		{
			ret += fullName.split(' ')[idx] + ' '; //concat every name except first
		}
		
	}
	return ret.substring(0, ret.length-1); //remove trailing space
}

function getCurDate()
{
	var dateLcl = new Date();
	var date = dateLcl.getDate();
	var month = dateLcl.getMonth()+1
	var year = dateLcl.getFullYear();
	
	var hr = dateLcl.getHours();
	var min = dateLcl.getMinutes();
	var time = hr>12 ? hr-12 + ':' + min + 'PM' : hr + ':' + min + 'AM'; //adjust to AM / PM format
	
	return month + '/' + date + '/' + year + ' ' + time;
}

app.get('/', function (req, res) {
 console.log(res);
  res.send('Here is a blank homepage.')
})

app.get('/api/sample',  function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.status(200);
	
	var retObj = {
		data: storedCMS,//content of api/sample.json file goes here
		metadata: {
			generated: getCurDate() //current date and time
    }
}
	
	res.send(retObj);
})

app.post('/api/parse', function (req, res) {
	
	var rawData = req.files.amida_file.data.toString();

	var demoData = rawData.substring(rawData.indexOf('Demographic')); //assume that demographics section begins with this string. Store in array for easier 
	

	//build the object to be returned
	//assumptions: 
	// -name field has minimum of two words- the first name is the first word, then the last name is the remaining words,
	//	So like "John Doe Rae Me" would parse as first_name: John, last_name: Doe Rae Me
	// -assuming the address format "address line 1, address line 2" for multiple line addresses
	var retObj = {
		name: {
			first_name: getField('Name', demoData).split(' ')[0],
			last_name: getLastName(getField('Name', demoData))
		},
		dob: getField('Date of Birth', demoData),
		address: getField('Address Line 1', demoData) + ', ' + getField('Address Line 2', demoData),
		city: getField('City', demoData),
		state: getField('State', demoData),
		zip: getField('Zip', demoData),
		phone: getField('Phone Number', demoData),
		email: getField('Email', demoData),
		coverage: [{
			type: 'Part A',
			effective_data: getField('Part A Effective Date', demoData)
		},
		{
			type: 'Part B',
			effective_data: getField('Part B Effective Date', demoData)
		}]
	}
	fs.writeFileSync('./post.json', JSON.stringify(retObj));
	res.status(200);
	res.send("File written; value saved is:   " + JSON.stringify(retObj));
})

exports.app = app;