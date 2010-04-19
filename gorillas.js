function quantize(min, max, block) {
    return (Math.round(Math.random() * max) + min) * block;
}

function between(value, min, width) {
    return (value >= min) && (value < min + width);
}

function colorEq(a, b) {
    var f = Math.pow(a[0] - b[0], 2) +
            Math.pow(a[1] - b[1], 2) +
            Math.pow(a[2] - b[2], 2);
    return f < 100;
//    return a[0] == b[0] &&  a[1] == b[1] && a[2] == b[2];
}

function Gorillas(canvasElement) {
    this.throwBanana = throwBanana;

    var gravity = 9.8 / 10;
    var windowWidth = 14;
    var windowHeight = 20;
    var windowPaddingWidth = 4;
    var windowPaddingHeight = 4;
    var bottomBorder = 20;
    var backgroundColor = "rgb(4,2,172)";
    var backgroundTest = [4, 2, 172];
    var sunTest = [252, 254, 4];
    var buildingColors = [
            "rgb(4,170,172)",  // Teal
            "rgb(172,2,4)",    // Red
            "rgb(172,170,172)" // Grey
    ];
    var windowColors = [
            "rgb(252,254,84)",  // On
            "rgb(84,86,84)" // Off
    ];
    
    var turn = 0;
    var gorillaPositions = [];
    var canvas = canvasElement.getContext('2d');
    var sunImage = new Image();
    sunImage.src = 'sun.png';
    var gorillaImage = new Image();
    gorillaImage.src = 'gorilla-resting.png';
    
    
    drawLandscape();
    
    function drawSun() {
        canvas.drawImage(sunImage, Math.round((canvasElement.width - sunImage.width) / 2), 15);
    }
    
    function drawLandscape() {
        var width = canvasElement.width;
        var height = canvasElement.height;
        var gorillaOffset = Math.round(width / 5);
    
        // "Gorilla Blue" background
        canvas.fillStyle = backgroundColor;
        canvas.fillRect(0, 0, width, height);

        drawSun();
        
        var buildingOffset = 0;
        while (buildingOffset < width) {
            var buildingWidth = quantize(4, 4, windowWidth);
            var buildingHeight = quantize(2, 10, windowHeight);
            
            // Building background
            canvas.fillStyle = buildingColors[Math.floor(Math.random() * 3)];
            canvas.fillRect(buildingOffset,
                            height - bottomBorder,
                            buildingWidth,
                            -buildingHeight);
            
            // Windows
            for (var i = 0, li = buildingWidth / windowWidth; i < li; i++) {
                for (var j = 0, lj = buildingHeight / windowHeight; j < lj; j++) {
                    canvas.fillStyle = windowColors[Math.floor(Math.random() * 2)];
                    canvas.fillRect(buildingOffset + (i * windowWidth) + windowPaddingHeight,
                            height - bottomBorder - (j * windowHeight) - windowPaddingWidth,
                            windowWidth - (windowPaddingWidth * 2),
                            -windowHeight + (windowPaddingHeight * 2));
                }                
            }

            // See if we have the starting places
            if (between(gorillaOffset, buildingOffset, buildingWidth + 1)) {
                gorillaPositions[0] = [Math.round(buildingOffset + ((buildingWidth - gorillaImage.width) / 2)),
                                       height - 20 - buildingHeight - gorillaImage.height];
            }
            if (between(width - gorillaOffset, buildingOffset, buildingWidth + 1)) {
                gorillaPositions[1] = [Math.round(buildingOffset + ((buildingWidth - gorillaImage.width) / 2)),
                                       height - 20 - buildingHeight - gorillaImage.height];
            }
            
            buildingOffset += buildingWidth + 1;
        }
        
        // Gorillas
        canvas.drawImage(gorillaImage, gorillaPositions[0][0], gorillaPositions[0][1]);
        canvas.drawImage(gorillaImage, gorillaPositions[1][0], gorillaPositions[1][1]);
    }
    
    function throwBanana(angle, speed) {
        var bananaRadius = 5;
        var lastX, lastY;
        
        var actualAngle = Math.PI * (turn == 0 ? angle : 180 - angle) / 180;
        var velocity = [Math.cos(actualAngle) * speed, -Math.sin(actualAngle) * speed];
        
        
        drawBanana(gorillaPositions[turn][0] + (turn == 0 ? bananaRadius : gorillaImage.width - bananaRadius), 
                   gorillaPositions[turn][1] - bananaRadius);
        
        var quantum = 100;
        var timerId = setInterval(function() {
            var hit = drawBanana(lastX + (quantum / 1000) * velocity[0], 
                                 lastY + (quantum / 1000) * velocity[1]);
            drawSun();
            
            velocity[1] += gravity;
            
            if (hit || lastY > canvasElement.height + bananaRadius) {
                clearInterval(timerId);
            }
        }, quantum);
        
        
        turn = (turn + 1) % 2;
        
        function drawBanana(x, y) {
            if (typeof(lastX) != 'undefined') {
                canvas.fillStyle = backgroundColor;
                canvas.beginPath();
                canvas.arc(lastX, lastY, bananaRadius + 1, 0, 2 * Math.PI, false);
                canvas.fill();                
            } else {
                lastX = x;
                lastY = y;
            }
            
            var magV = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
            var unitV = [velocity[0] / magV, velocity[1] / magV];
            var testPixel = [Math.round(x + unitV[0] * bananaRadius), 
                             Math.round(y + unitV[1] * bananaRadius)];
            netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
            if (between(testPixel[0], 0, canvasElement.width) &&
                between(testPixel[1], 0, canvasElement.height)) {
                var pixel = canvas.getImageData(testPixel[0], testPixel[1], 1, 1);
                if ((!colorEq(pixel.data, backgroundTest)) &&
                    (!colorEq(pixel.data, sunTest))) {
                    return true;
                }
            }

            canvas.fillStyle = windowColors[0];
            canvas.beginPath();
            canvas.arc(x, y, bananaRadius, 0, 2 * Math.PI, false);
            canvas.fill();
            
            lastX = x;
            lastY = y;
            
            return false;
        }
    }
}
