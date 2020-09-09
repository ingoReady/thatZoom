/* ThatZoom -- simple zooming routine with movable lens for loaded images
 * 
 * 
 * Copyright © 2020 Ingo Kieslich (keysling@gmail.com)
 * 
 * This file is part of "thatZoom".
 * 
 * "thatZoom" is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * "thatZoom" is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with "thatZoom".  If not, see <https://www.gnu.org/licenses/>.
*/

function thatZoom() {
    var imgHeight = [];
    var zFactor = 2;
    updZoomFactor()                                                                 //initial update of the zoom button to display zoom factor                                                
    document.getElementById("zoomBtn").style.backgroundColor = "#dddddd";           //reset zoom button
    document.getElementById("zoomBtn").setAttribute ("onclick", null);
    document.getElementById("zoomBtn").setAttribute ("onclick", "thatZoomOff()");
    document.getElementById("showZoomFactor").style.display = "block";
    
    function updZoomFactor() {document.getElementById("showZoomFactor").innerText = zFactor + "x";}
    
    var firstImg = document.querySelectorAll('.zImage')[0];                         //check whether there is an image at all
    if ( firstImg == undefined || firstImg.height < 1 ) {                           //if not kill thatZoom and send a warning
        var warning = true;
        thatZoomOff(warning);
    } else {
        // prepare zooming 
        var allImgConts = document.querySelectorAll('.thatZoom');
        allImgConts.forEach( function(imgCont) {                                    //built lenses for each image
        var lens = document.createElement("div");
        lens.setAttribute("class", "theLens");
        var lensFront = document.createElement("span");
        lensFront.setAttribute("class", "lensFront");
        var lensBack = document.createElement("span");
        lensBack.setAttribute("class", "lensBackground");
        var loadText = document.createTextNode("Image not ready...");
        lensBack.appendChild(loadText);
        lens.appendChild(lensBack);
        lens.appendChild(lensFront);
        var image = imgCont.querySelectorAll('.zImage')[0];
        imgCont.insertBefore(lens, image);
        var imgWidth = image.getBoundingClientRect().width;
        var lensDim = imgWidth / 5;                                                 //set size of lens and warning message relative to image size 
        lensBack.style.fontSize = lensDim / 10 + "px";

        lens.addEventListener("mousemove", moveLens);                              
        image.addEventListener("mousemove", moveLens);
        lens.addEventListener("touchmove", moveLens);
        image.addEventListener("touchmove", moveLens);
        
        image.addEventListener("mouseleave", offImage);                             //lens should be active only when mouse is on image
        image.addEventListener("mouseover", inImage);
        lens.addEventListener("mouseleave", offImage);
        lens.addEventListener("mouseover", inImage);
        lens.addEventListener("click", clickImage);                                 //click to change zoom factor
        
        if (image.matches(':hover') ) {                                             //this hover check is needed because mouseover / mouseenter is not fired  
            lens.style.display="inline";                                            //if pointer is already on image while event is applied.
        }                                                                           //case for Arendt Edition: when window changes to a facsimile view. Only for aesthetic reasons.
        function offImage() {lens.style.display="none";}
        function inImage() {
            lens.style.display="inline";
            loadBack();                                                             //when pointer is on image update lens image and position
            image.addEventListener("load", function() {loadBack();});               //do this for all images on page and those still loading
            var position = getMousePosition(event);
            moveLens(event);
        }
        function clickImage() {                                                     //change zoom factor by clicking when lens is active and update lens
            zFactor = zFactor + 2;                                                  //set max zoom factor and increments here
            if (zFactor == 16) {zFactor = 2;}
            updZoomFactor();
            loadBack();
            var position = getMousePosition(event);
            moveLens(event);
        }
        
        function loadBack() {
            imgUrl = image.getAttribute("data-src");                                //create image as a background for lens and blow up its size by the zoom factor
            lensFront.style.backgroundImage = "url('" + imgUrl + "')";
            lensFront.style.backgroundSize = (image.width * zFactor) + "px " + (image.height * zFactor) + "px";};
 
        function moveLens(event) {
            var position = getMousePosition(event);                                //get pointer position
            var lensX = position.mouseX;
            var lensY = position.mouseY;
            var hLenseHeight = lensDim / 2;
            var hLenseWidth = lensDim / 2; 
            lens.style.left = (position.mouseX - hLenseWidth) + "px";              //update position of lens to that of pointer
            lens.style.top = (position.mouseY - hLenseHeight) + "px";              //pointer is in the center of lens
            lens.style.width = lensDim + "px";                                     //set lens dimensions 
            lens.style.height = lensDim + "px";
            posCorX = hLenseWidth - 3;                                             //initial data to adapt lens focus when lens in this middle of image
            posCorY = hLenseHeight - 3;                                            //take border of lens (default 3 px) into account
            //define what happens to lens if it is moved to image borders
            //right 
            if ( lensX > image.width - hLenseWidth) {                              
                var overhangR = (lensX + hLenseWidth) - imgWidth;                  //shrink lens if it moves half out of image
                lens.style.width = lensDim - overhangR + 3 + "px";
                //posCorX = ((hLenseWidth + overhangR + 3) / zFactor) + 60;        //use this if lens should not be flush with border
                //posCorX = (hLenseWidth - 3 * zFactor) + overhangR / zFactor; 
                var b = (zFactor - 2);                                             //this adapts the focus of the lens to its position on the image
                lensX = lensX + zFactor / 2;                                       //so that if lens is at the border of image it also focusses on that part
                posCorX = hLenseWidth + (zFactor * b);                             //effectively this is the curvature of a lens, since the magnified image is larger than the image on which the lens moves
            }                                                                                   
            //left
            if ( lensX < hLenseWidth ) {
                var overhangL = hLenseWidth - lensX;
                lens.style.width = lensDim - overhangL + 3 + "px";
                lens.style.left = "-3px";
                posCorX = (hLenseWidth - 3 * zFactor) - overhangL; 
                //posCorX = (hLenseWidth - overhangL - 3) / zFactor;
            }                                                                                                               
            //bottom
            if ( lensY > image.height - hLenseHeight ) {
                var overhangB = (lensY + hLenseHeight) - image.getBoundingClientRect().height;
                lens.style.height = lensDim - overhangB + 3 + "px";
                var b = (zFactor - 2) ;
                lensY = lensY + zFactor / 2;
                posCorY = hLenseHeight + (zFactor * b);
                //posCorY = (hLenseHeight + overhangB + 3)  / zFactor;
            }                                                                                                             
            //top
            if ( lensY < hLenseHeight ) {
                var overhangT = hLenseHeight - lensY;
                lens.style.height = lensDim - overhangT + "px";
                lens.style.top = "-3px";
                posCorY = (hLenseHeight - 3 * zFactor) - overhangT;
            }                                                                                                             
            
            //move the background image behind the lens into position relative to mouse position, thus negative values
            lensFront.style.backgroundPosition = "-" + ((lensX * zFactor) - posCorX) + "px -" + ((lensY * zFactor) - posCorY) + "px";
        }
        
        function getMousePosition(event) {
            event = window.event;                                                            //get mouse move event as object
            var imageX = image.getBoundingClientRect().left;
            var imageY = image.getBoundingClientRect().top;
            return {mouseX : event.pageX - imageX - window.pageXOffset,                      //adapt overall mouse position to image position
                    mouseY : event.pageY - imageY - window.pageYOffset};                     //take page scrolling into account
        }
    })
    };
}


//turn off thatZoom and remove all its stuff from webpage
function thatZoomOff(warning) {
    document.getElementById("showZoomFactor").style.display = "none";
    var allImages = document.querySelectorAll('.zImage');
    allImages.forEach( function(image) {
        image.style.cursor = "auto";                                                        //reset pointer for images
    }) 
    if (warning === true) {                                                                 //if warning was sent (if thatZoom did not find any images)
        document.getElementById("zoomBtn").classList.toggle("BtnWarning");                  //show red button 
        setTimeout(function(){  
            document.getElementById("zoomBtn").classList.toggle("BtnWarning");
        }, 500);
    } 
    document.getElementById("zoomBtn").style.backgroundColor = "#FFFFFF";
    var allLenses = document.querySelectorAll('.theLens');
    allLenses.forEach( function(lens) {
        lens.parentNode.removeChild(lens);                                                  //remove all lenses
    })
    document.getElementById("zoomBtn").setAttribute ("onclick", null);                      //reset zoom button
    document.getElementById("zoomBtn").setAttribute ("onclick", "thatZoom()");
}













