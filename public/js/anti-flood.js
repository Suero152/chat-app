let FLOOD_TIME = 7500;
let FLOOD_MAX = 5;

let flood = {
    floods: {},
    warnings: {},
    lastFloodClear: new Date(),
    protect: (io, socket) => {

        // Reset flood protection
        if( Math.abs( new Date() - flood.lastFloodClear) > FLOOD_TIME ){
            flood.floods = {};
            flood.lastFloodClear = new Date();
        }

        flood.floods[socket.id] == undefined ? flood.floods[socket.id] = {} : flood.floods[socket.id];
        flood.floods[socket.id].count == undefined ? flood.floods[socket.id].count = 0 : flood.floods[socket.id].count;
        flood.floods[socket.id].count++;


        //Disconnect the socket if he went over FLOOD_MAX in FLOOD_TIME
        if( flood.floods[socket.id].count > FLOOD_MAX){
            flood.warnings[socket.id] === undefined ? flood.warnings[socket.id] = {}: flood.warnings[socket.id]
            flood.warnings[socket.id].warnings == undefined ? flood.warnings[socket.id].warnings = 0: flood.warnings[socket.id].warnings
            flood.warnings[socket.id].warnings += 1
            flood.floods[socket.id].count = 0
            if (flood.warnings[socket.id].warnings > 1){
                socket.emit('kick', 'Flooding.')
            }
            return false;
        }
        return true;
    }
}

exports = module.exports = flood;