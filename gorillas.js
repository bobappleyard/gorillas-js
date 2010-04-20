function Gorillas(canvasElement) {
    this.throwBanana = throwBanana;
    
    var fps = 15;
    var gravity = 9.8 / fps;
    var quantum = 1000 / fps;
    var windowWidth = 14;
    var windowHeight = 20;
    var windowPaddingWidth = 4;
    var windowPaddingHeight = 4;
    var bottomBorder = 20;
    var backgroundColor = "rgb(4,2,172)";
    var backgroundTest = [4, 2, 172];
    var sunTest = [252, 254, 4];
    var gorillaTest = [252, 170, 84];
    var buildingColors = [
            "rgb(4,170,172)",  // Teal
            "rgb(172,2,4)",    // Red
            "rgb(172,170,172)" // Grey
    ];
    var windowColors = [
            "rgb(252,254,84)",  // On
            "rgb(84,86,84)"     // Off
    ];
    var HIT_NOTHING = 0;
    var HIT_BUILDING = 1;
    var HIT_GORILLA = 2;
    
    var turn = 0;
    var scores = [0, 0];
    var gorillaPositions = [];
    var running = false;

    var canvas = canvasElement.getContext('2d');
    var sunImage = new Image();
    sunImage.src = 'sun.png';
    var gorillaImage = new Image();
    gorillaImage.src = 'gorilla-resting.png';  
    
    drawLandscape();
    
    // Utility functions
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
    }
    
    // Background
    function clearSun() {
        canvas.fillStyle = backgroundColor;
        canvas.fillRect((canvasElement.width - sunImage.width) / 2, 15, sunImage.width, sunImage.height);
    }
    
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
        if (!running) {
            running = true;
            var bananaRadius = 5;
            
            // Initial conditions
            var actualAngle = Math.PI * (turn == 0 ? angle : 180 - angle) / 180;
            var velocity = [Math.cos(actualAngle) * speed, -Math.sin(actualAngle) * speed];
            var x = gorillaPositions[turn][0] + (turn == 0 ? bananaRadius : gorillaImage.width - bananaRadius);
            var y = gorillaPositions[turn][1] - bananaRadius;
            drawBanana();
            
            // Projectile simulation
            var banana = setInterval(function() {
                clearBanana();
                clearSun();

                x += (quantum / 1000) * velocity[0];
                y += (quantum / 1000) * velocity[1];

                var hit = hitTest();
                drawSun();
                
                velocity[1] += gravity;
                
                switch (hit) {
                case HIT_BUILDING:               
                    stop();
                    clearBanana();
                    break;
                case HIT_GORILLA:
                    stop();
                    killGorilla()
                    break;
                default:
                    drawBanana();
                    if (y > canvasElement.height + bananaRadius) {
                        stop();
                    }
                }
            }, quantum);
            
            turn = (turn + 1) % 2;
        }
        
        function hitTest() {
            var magV = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
            var unitV = [velocity[0] / magV, velocity[1] / magV];
            var testPixel = [Math.round(x + unitV[0] * bananaRadius), 
                             Math.round(y + unitV[1] * bananaRadius)];
            netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
            if (between(testPixel[0], 0, canvasElement.width) &&
                between(testPixel[1], 0, canvasElement.height)) {
                var pixel = canvas.getImageData(testPixel[0], testPixel[1], 1, 1);
                if (colorEq(pixel.data, gorillaTest)) {
                    return HIT_GORILLA;
                }
                if (!colorEq(pixel.data, backgroundTest)) {
                    return HIT_BUILDING;
                }
            }
            return HIT_NOTHING;
        }
        
        function stop() {
            clearInterval(banana);
            running = false;
        }
        
        // Drawing functions
        function clearBanana() {
            canvas.fillStyle = backgroundColor;
            canvas.beginPath();
            canvas.arc(x, y, bananaRadius + 2, 0, 2 * Math.PI, false);
            canvas.fill();        
        }
        
        function drawBanana() {           
            canvas.fillStyle = windowColors[0];
            canvas.beginPath();
            canvas.arc(x, y, bananaRadius, 0, 2 * Math.PI, false);
            canvas.fill();
        }
        
        function killGorilla() {
            var which = x > canvasElement.width / 2 ? 1 : 0;
            var oldTurn = (turn + 1) % 2;
            scores[oldTurn] += which == oldTurn ? -1 : 1;
            document.getElementById("score0").textContent = scores[0];
            document.getElementById("score1").textContent = scores[1];
            // explosion
            x = Math.round(gorillaPositions[which][0] + gorillaImage.width / 2);
            y = Math.round(gorillaPositions[which][1] + gorillaImage.height / 2);
            var oldR = bananaRadius;
            bananaRadius *= 5;
            clearBanana();
            bananaRadius = oldR;
            var refresh = setInterval(function() {
                drawLandscape();
                clearInterval(refresh);
            }, 3000);
        }
    }
}
