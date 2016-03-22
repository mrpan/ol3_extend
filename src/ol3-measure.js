
ol.control.Measure = function(opt_options) {

    var options = opt_options || {};

    var tipLabel = options.tipLabel ?
      options.tipLabel : 'Measure';

    this.mapListeners = [];

    this.geodesic =true; //大地距离

    this.hiddenClassName = 'ol-unselectable ol-control measure';
    this.shownClassName = this.hiddenClassName + ' shown';

    var element = document.createElement('div');
    element.className = this.hiddenClassName;

    var button = document.createElement('button');
    button.setAttribute('title', tipLabel);
    element.appendChild(button);
    var this_ = this;

    element.onmouseover = function(e) {
    };

    button.onclick = function(e) {
        this_.draw.setActive(true);
        this_.createMeasureTooltip();
        e.preventDefault();
    };

    element.onmouseout = function(e) {
        e = e || window.event;
       
    };

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
    
};

ol.inherits(ol.control.Measure, ol.control.Control);


ol.control.Measure.prototype.setMap = function(map) {
    // Clean up listeners associated with the previous map
    for (var i = 0, key; i < this.mapListeners.length; i++) {
        this.getMap().unByKey(this.mapListeners[i]);
    }
    this.mapListeners.length = 0;
    // Wire up listeners etc. and store reference to new map
    ol.control.Control.prototype.setMap.call(this, map);
    if (map) {
       this.addDrawLayer();
       this.addDrawInteraction();
       this.createHelpTooltip();
       this.createMeasureTooltip();
    }
};

ol.control.Measure.prototype.addDrawLayer = function(){
    this.source = new ol.source.Vector();
    this.drawLayer = new ol.layer.Vector({
        source: this.source,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          })
        })
      });
    var map = this.map_;
    map.addLayer(this.drawLayer);
};
ol.control.Measure.prototype.addDrawInteraction = function(){
    this.draw = new ol.interaction.Draw({
            source: this.source,
            type: "LineString",
            style: new ol.style.Style({
              fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
              }),
              stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
              }),
              image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                  color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                  color: 'rgba(255, 255, 255, 0.2)'
                })
              })
            })
          });
    var map = this.map_;
    if(map){
          map.addInteraction(this.draw);
          this.draw.setActive(false);
    };
    var that = this;
    var listener;
    this.draw.on('drawstart',
          function(evt) {
            // set sketch
             that.sketch = evt.feature;

            
            var tooltipCoord = evt.coordinate;

            listener = that.sketch.getGeometry().on('change', function(evt) {
              var geom = evt.target;
              var output;
         
            output = that.formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
            that.measureContent.innerHTML = output;
            that.measureTooltip.setPosition(tooltipCoord);
            });
          }, this.draw);
     this.draw.on('drawend',
          function() {
            that.measureTooltipElement.className = 'measureTooltip tooltip-static';
            that.measureTooltip.setOffset([0, -7]);
            // unset sketch
            that.sketch = null;
            // unset tooltip so that a new one can be created
            that.measureTooltipElement = null;
            ol.Observable.unByKey(listener);
            this.setActive(false);
          }, this.draw);
           
};



ol.control.Measure.prototype.createHelpTooltip= function() {
        if (this.helpTooltipElement) {
            this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
          }
          this.helpTooltipElement = document.createElement('div');
          this.helpTooltipElement.className = 'measureTooltip hidden';
          this.helpTooltip = new ol.Overlay({
            element: this.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
          });
          this.map_.addOverlay(this.helpTooltip);
}


ol.control.Measure.prototype.createMeasureTooltip = function() {
    if (this.measureTooltipElement) {
        this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
      }
      this.measureTooltipElement = document.createElement('div');
      this.closeElement = document.createElement('a');
      this.closeElement.className ='ol-measure-closer';
      this.measureTooltipElement.appendChild(this.closeElement);
      this.measureContent = document.createElement('div');
      this.measureTooltipElement.appendChild(this.measureContent);
      this.measureTooltipElement.className = 'measureTooltip tooltip-measure';
      this.measureTooltip = new ol.Overlay({
        element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
      });
      this.map_.addOverlay(this.measureTooltip);
      var that = this;
      this.closeElement.addEventListener('click',function(){
            that.drawLayer.getSource().clear();
            that.map_.removeOverlay(that.measureTooltip);
      },false);
         
}

ol.control.Measure.prototype.formatLength = function(line) {
        var length;
        var wgs84Sphere = new ol.Sphere(6378137);
        if (this.geodesic) {
          var coordinates = line.getCoordinates();
          length = 0;
          var sourceProj = map.getView().getProjection();
          for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
            var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
            length += wgs84Sphere.haversineDistance(c1, c2);
          }
        } else {
          length = Math.round(line.getLength() * 100) / 100;
        }
        var output;
        if (length > 100) {
          output = (Math.round(length / 1000 * 100) / 100) +
              ' ' + 'km';
        } else {
          output = (Math.round(length * 100) / 100) +
              ' ' + 'm';
        }
        return output;
};