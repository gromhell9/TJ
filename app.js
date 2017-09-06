'use strict';

const JOHNNY_FILE_1 = './res/johnny_1.js';
const JOHNNY_FILE_2 = './res/johnny_2.js';
const HEADER_FILE_1 = './res/header_1.js';
const HEADER_FILE_2 = './res/header_2.js';
const BODY_FILE_1 = './res/body_1.js';
const BODY_FILE_2 = './res/body_2.js';
const SERVER_PORT = 4558;

// Initialize Socket Server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const fs = require('fs');
const sp = require('serialport');

// Child Process for Johnny-Five and init
var spawn = require('child_process').spawn;
var johnnyScript = null;
initJohnny_1();

server.listen(SERVER_PORT, function(){
    console.log('[LOG] Listening on :' + SERVER_PORT);
});

app.use(express.static(__dirname));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(client){
    console.log('[LOG] IDE is connected.');

    sp.list(function (err, ports) {
      ports.forEach(function(port) {
        console.log('[LOG] ' + port.comName + ': ' + port.manufacturer);
        client.emit('ports', port);
      });
    });

    client.on('execute_1', function(data){
        try {
            console.log('[LOG] Script File:\n' + data.code);

            fs.writeFile(BODY_FILE_1, data.code, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log('[LOG] The Body file was saved!');
            });
            restartJohnny_1(client);

        } catch (err) {
            console.error('[ERR] Failed to execute script.', err);
        }
    });

    client.on('execute_2', function(data){
        try {
            console.log('[LOG] Script File:\n' + data.code);

            fs.writeFile(BODY_FILE_2, data.code, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log('[LOG] The Body file was saved!');
            });
            restartJohnny_2(client);

        } catch (err) {
            console.error('[ERR] Failed to execute script.', err);
        }
    });

    initConsole(client);
});

function restartJohnny_1(client){
    johnnyScript.kill();

    var _code = '';
    fs.readFile(HEADER_FILE_1, 'utf8', function(err, data) {
      _code += data;
      fs.readFile(BODY_FILE_1, 'utf8', function(err, data) {
        _code += data;
        fs.writeFile(JOHNNY_FILE_1, _code, function(err) {
            console.log('[LOG] The Johnny file was created!');
            initJohnny_1();
            initConsole(client)
        });
      });
    });
}

function restartJohnny_2(client){
    johnnyScript.kill();

    var _code = '';
    fs.readFile(HEADER_FILE_2, 'utf8', function(err, data) {
      _code += data;
      fs.readFile(BODY_FILE_2, 'utf8', function(err, data) {
        _code += data;
        fs.writeFile(JOHNNY_FILE_2, _code, function(err) {
            console.log('[LOG] The Johnny file was created!');
            initJohnny_2();
            initConsole(client)
        });
      });
    });
}

function initJohnny_1(){
    johnnyScript = spawn('node', [JOHNNY_FILE_1]);
    johnnyScript.stdin.setEncoding('utf-8');
    johnnyScript.stdout.pipe(process.stdout);
    johnnyScript.stderr.pipe(process.stderr);
}

function initJohnny_2(){
    johnnyScript = spawn('node', [JOHNNY_FILE_2]);
    johnnyScript.stdin.setEncoding('utf-8');
    johnnyScript.stdout.pipe(process.stdout);
    johnnyScript.stderr.pipe(process.stderr);
}

function initConsole(client){
    johnnyScript.stdout.on('data', function(data) {
        client.emit('console', data.toString());
    });

    johnnyScript.stderr.on('data', function(data) {
        client.emit('console', data.toString());
    });
}
