OpenLayers.Geometry.LineString.createBezier= function(originPoint,targetPoint,theta,num_points){
    var azimuth = getAzimuth(originPoint,targetPoint);
    var base_length = getPointLength(originPoint,targetPoint)
    var theta_adj
    if(azimuth >= 180){
       theta_adj= -1 * theta * Math.sin(azimuth);
    }else{
       theta_adj= theta * Math.sin(azimuth);
    }
    var hyp_len =base_length/(Math.cos(theta_adj*Math.PI/180));
    var p2 = originPoint.clone();
    p2.move(Math.sin((azimuth-theta_adj)*Math.PI/180)*hyp_len,Math.cos((azimuth-theta_adj)*Math.PI/180)*hyp_len);
    var points = [];
    points.push(originPoint);
    for(var i=0;i<num_points;i++){
        var p_value = 1/num_points*i;
        var x0 = ((1 - p_value)*(((1 - p_value)*originPoint.x) + (p_value * p2.x))) + (p_value * (((1 - p_value)*p2.x) + (p_value * targetPoint.x)))
        var y0 = ((1 - p_value)*(((1 - p_value)*originPoint.y) + (p_value * p2.y))) + (p_value * (((1 - p_value)*p2.y) + (p_value * targetPoint.y)))

        var point = new  OpenLayers.Geometry.Point(x0,y0);
        points.push(point);
    }
    points.push(targetPoint);
    var bezierLine = new OpenLayers.Geometry.LineString(points);
    return bezierLine;
   
}
var getAzimuth =function (pointA,pointB){
    var ty = pointB.y - pointA.y;
    var tx = pointB.x - pointA.x;
     var  theta = Math.atan2(tx, ty);
     var angle = theta * (180 / Math.PI);

    if(ty>0&&tx<=0){  
         angle=(90-angle)+90;  
    }else if(ty<=0&&tx<0){  
         angle=angle+180.;  
    }else if(ty<0&&tx>=0){  
         angle= (90-angle)+270;  
    }  
    angle =angle.toFixed(0) 

    return angle;

}

var getPointLength= function(pointA,pointB){

    var length
    var tx = pointB.x-pointA.x;
    var ty = pointB.y-pointA.y;
    if(Math.abs(tx)<=180){
        length = Math.sqrt(Math.pow(tx,2)+Math.pow(ty,2))*0.5
    }else{
        length= Math.sqrt(Math.pow(360-(tx),2)+Math.pow(ty,2))*0.5
    }
    return length
}