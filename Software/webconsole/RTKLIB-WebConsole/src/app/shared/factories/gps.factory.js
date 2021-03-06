/*
 * RTKLIB WEB CONSOLE code is placed under the GPL license.
 * Written by Frederic BECQUIER (frederic.becquier@openiteam.fr)
 * Copyright (c) 2016, DROTEK SAS
 * All rights reserved.

 * If you are interested in using RTKLIB WEB CONSOLE code as a part of a
 * closed source project, please contact DROTEK SAS (contact@drotek.com).

 * This file is part of RTKLIB WEB CONSOLE.

 * RTKLIB WEB CONSOLE is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * RTKLIB WEB CONSOLE is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with RTKLIB WEB CONSOLE. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

module.exports = /*@ngInject*/ function () {
    
    var a = 6378137;
    var f = 0.0034;
    var b = 6356800; //6.3568e6; 
    var e = Math.sqrt((Math.pow(a, 2) - Math.pow(b, 2)) / Math.pow(a, 2));
    var e2 = Math.sqrt((Math.pow(a, 2) - Math.pow(b, 2)) / Math.pow(b, 2));
    var dtr = Math.PI/180.0;
    
    return {
        dToR: dToR,
        eceftolla: eceftolla,
        eceftoenu: eceftoenu,
        llatoecef: llatoecef
    };
    
    function dToR (degrees){ 
      return degrees * (Math.PI / 180);
    }
    
    function eceftolla (currentEcef){

        var lat, lon, alt, N , theta, p;

        p = Math.sqrt(Math.pow(currentEcef.x, 2) + Math.pow(currentEcef.y, 2));

        theta = Math.atan((parseFloat(currentEcef.z) * a) / (p * b));

        lon = Math.atan(currentEcef.y / currentEcef.x);

        lat = Math.atan(((parseFloat(currentEcef.z) + Math.pow(e2, 2) * b * Math.pow(Math.sin(theta), 3)) / ((p - Math.pow(e, 2) * a * Math.pow(Math.cos(theta), 3)))));
        N = a / (Math.sqrt(1 - (Math.pow(e, 2) * Math.pow(Math.sin(lat), 2))));

        var m = (p / Math.cos(lat));
        alt = m - N;


        lon = lon * 180 / Math.PI;
        lat = lat * 180 / Math.PI;
        
        return {
            'lat': lat,
            'lng': lon,
            'alt': alt
        };

    }
    
    function eceftoenu(positionBase, positionRover, llhRover){
        
        //North = - sin (phi r) * cos (lambda r) * (Xp-Xr) -  sin (phi r) * sin (lambda r) * (Yp- Yr) +  cos (phi r) * (Zp - Zr)
        var north = - Math.sin(llhRover.lat) * Math.cos(llhRover.lng) * (positionRover.x-positionBase.x) -
                      Math.sin(llhRover.lat) * Math.sin(llhRover.lng) * (positionRover.y-positionBase.y) +
                      Math.cos(llhRover.lat) * (positionRover.z-positionBase.z);
        
        //East = - sin (lambda r) * (Xp-Xr) + cos (lambda r) * (Yp- Yr) + 0 * (Zp - Zr)
        var east =   - Math.sin(llhRover.lng) * (positionRover.x-positionBase.x) + 
                       Math.cos(llhRover.lng) * (positionRover.y-positionBase.y)
        
        return {
            'north': north,
            'east': east
        };
    }
    
    function llatoecef(currentLla){
        /*var n = a / Math.sqrt( 1 - Math.pow(e,2) * Math.pow(Math.sin(currentLla.lat),2) );
        
        var x = (n+currentLla.alt) * Math.cos(dtr*currentLla.lat) * Math.cos(dtr*currentLla.lng);
        var y = (n+currentLla.alt) * Math.cos(dtr*currentLla.lat)  *Math.sin(dtr*currentLla.lng);
        var z = ((Math.pow(b,2)/Math.pow(a,2)) * n + currentLla.alt) * Math.sin(dtr*currentLla.lat);*/
        
        var cosLat = Math.cos(currentLla.lat * Math.PI / 180.0);
        var sinLat = Math.sin(currentLla.lat * Math.PI / 180.0);
        var cosLon = Math.cos(currentLla.lng * Math.PI / 180.0);
        var sinLon = Math.sin(currentLla.lng * Math.PI / 180.0);
        var f = 1.0 / 298.257224;
        var C = 1.0 / Math.sqrt(cosLat * cosLat + (1 - f) * (1 - f) * sinLat * sinLat);
        var S = (1.0 - f) * (1.0 - f) * C;
        var h = currentLla.alt;
        
        return {
            'x': (a * C + h) * cosLat * cosLon,
            'y': (a * C + h) * cosLat * sinLon,
            'z': (a * S + h) * sinLat
        }
    }
    
};