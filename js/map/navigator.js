var apikey = encodeURIComponent("nxb4coDQx0Z6d7mjF6RT+g");

var map; // 지도 변수
var myPosition; // gps로 따오는 내 위치
var myPositionMarker; // gps로 따오는 내 위치에 찍는 마커
var myPositionInfowindow;
var coords;

var destinationMarker; // 검색시 찍는 마커

var centerMarker; // 지도 조작시 지도의 중앙에 찍는 마커
var centerLatlng; // 중심 lat, lng
var centerInfowindow; // 중심 infowindow


var autoGpsFlag = 0;
var geocoder = new google.maps.Geocoder(); // 주소 검색 google 이용

var currentBound;
var count = 0;

// var apikey = encodeURIComponent("nxb4coDQx0Z6d7mjF6RT+g");
var select = 0;

var startRouteMarker = [];
var startRouteCount = 0;
var endRouteMarker = [];
var endRouteCount = 0;

var routeinfowindow = [];
var checkOpenRouteinfowindow = [];

var startMarker, endMarker;
var polyline = [];
var polylineCount = 0;

var walkingPolyline = [];
var walkingPolylineCount = 0;

var mouseMarker = [];
var mouseMarkerCount = 0;
var mouse3words = [];
var mouseInfowindow = [];
var checkOpenMouseinfowindow = [];

var placeOverlay = new daum.maps.CustomOverlay({
    zIndex: 1
  }),
  contentNode = document.createElement('div'), // 커스텀 오버레이의 컨텐츠 엘리먼트 입니다
  markers = [], // 마커를 담을 배열입니다
  currCategory = ''; // 현재 선택된 카테고리를 가지고 있을 변수입니다
var ps = new daum.maps.services.Places(map);

//   var tmap = "ff86385d-b74a-429a-b76b-72e1d7ca293a";
var headers = {};
headers["appKey"] = encodeURIComponent("2ef43265-0641-4807-aa97-e00e7f22ad19");

var node = function(name, x, y) {
  this.name = name;
  this.x = x;
  this.y = y;
  this.next = null;
}

var objectNode = function(object) {
  //function objectNode(object) {
  this.object = object;
  this.next = null;
}

var linkedList = function() {
  this.length = 0;
  this.headNode = new node(null);
}
/*
var objectLinkedList = function () {
    this.length = 0;
    this.headNode = new objectNode(null);
}
*/
var routeItem = new linkedList();
/*
var str = new objectLinkedList();
var obj = new objectLinkedList();
var strcnt = 1;
var objcnt = 1;
*/

str = [];
obj = [];
var strcnt = 0;
var objcnt = 0;
var airplaneCount = 0,
  exbusCount = 0,
  outbusCount = 0,
  trainCount = 0;

var type = -1;

linkedList.prototype.add = function(name, x, y, position) {
  //position이 null일 경우 마지막위치로
  var position = position == undefined ? this.length + 1 : position;

  //입력값으로 node 생성

  var newNode = new node(name, x, y);

  var preNode = this.headNode;
  for (i = 1; i < position; i++) {
    preNode = preNode.next;
  }
  newNode.next = preNode == null ? null : preNode.next;
  preNode.next = newNode;
  this.length++;
}


linkedList.prototype.remove = function(position) {
  var ret = null;
  var position = position == undefined ? 0 : position;
  if (this.isEmpty()) {
    console.log("list is Empty");
  } else if (position < this.length) {
    var preNode = this.headNode;

    for (i = 0; i < position; i++) {
      preNode = preNode.next;
    }
    ret = preNode.next.data;
    preNode.next = preNode.next.next;

    this.length--;
  } else {
    console.log("index error");
  }

  return ret;
}


linkedList.prototype.peek = function(position) {

  var ret = null;
  var position = position == undefined ? 0 : position;
  if (this.isEmpty()) {
    console.log("list is Empty");
  } else if (position < this.length) {
    var preNode = this.headNode;

    for (i = 0; i < position; i++) {
      preNode = preNode.next;

    }
    ret = preNode.next.data;

  } else {
    console.log("index error");
  }

  return ret;
}
//var inode = routeItem.headNode.next;
linkedList.prototype.print = function() {

  $("#route").empty();

  var inode = this.headNode.next;
  while (inode != null) {

    str[strcnt] = document.createElement('input');
    str[strcnt].type = "button";

    str[strcnt].value = inode.name;

    route.appendChild(str[strcnt]);



    if (inode.next != null) {
      obj[objcnt] = document.createElement('input');
      obj[objcnt].type = "button";
      // obj.onclick = showRoute(node, node.next);
      obj[objcnt].style = "padding:0 5px;margin:0 5px;";
      obj[objcnt].value = "->";

      (function(str, strcnt, obj, inode) {
        str[strcnt].addEventListener("click", function() {
          deleteNode(str, strcnt, obj, inode);
          // alert(inode.name + " " + strcnt);
        });
      })(str, strcnt++, obj, inode);

      route.appendChild(obj[objcnt]);


      (function(inode, nextinode, objcnt) {
        $(obj[objcnt]).on("click", function() {
          sendParameterToSearchRoute(inode, nextinode);
        });

      })(inode, inode.next, objcnt);

      objcnt++;

    }

    inode = inode.next;
  };

}

linkedList.prototype.isEmpty = function() {
  var ret = false;
  if (!this.length) {
    ret = true;
  }
  return ret;
}


// 카테고리 목록 보기
function callCategory() {
  var a = document.getElementById("category");
  if (a.style.display == 'block') a.style.display = 'none';
  else if (a.style.display == 'none') a.style.display = 'block';
}

// 내 위치로 복귀
function backToMyPosition() {
  //alert(coords);
  if (coords == undefined) {
    var e = document.getElementById("popupAlertPosition");

    e.style.display = 'block';

    document.getElementById("alerttext").innerHTML = "GPS에 연결할 수 없습니다.";
    t = $("<a href='javascript:void(0)' onclick='closePopUp();'><span class='btnTime'>OK</span></a>");
    $("#customAlert").append(t);
    return;
  } else moveCamera(position.coords.latitude, position.coords.longitude);
}


function initMap() {
  // serach() 함수가 뭔지 모르겠음.... 일단 주석
  // serach()
  var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
  var options = { //지도를 생성할 때 필요한 기본 옵션
    center: new daum.maps.LatLng(37.561143, 126.985856), //지도의 중심좌표.
    level: 6, //지도의 레벨(확대, 축소 정도)
    disableDoubleClickZoom: true
  };
  map = new daum.maps.Map(container, options); //지도 생성 및 객체 리턴


  // gps에서 사용자 위치 따와 마커로 표시
  // 없는 변수 호출 - 일반 보류
  // getMyLocation();
  setTile(); // 화면 선으로 분할

  // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성
  //  var zoomControl = new daum.maps.ZoomControl();
  // map.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);

  // zoom 변할 때 마다, 화면 분할 함수 호출
  daum.maps.event.addListener(map, 'zoom_changed', function() {
    setTile();
    if (centerMarker != null) centerMarker.setMap(null);
  });

  // daum.maps.event.addListener(map, 'idle', searchPlaces);

  daum.maps.event.addListener(map, 'dblclick', function(mouseEvent) {

    $.ajax({
      url: '/map/marker',
      type: 'get',
      data: 'x_center=' + mouseEvent.latLng.getLat() + '&y_center=' + mouseEvent.latLng.getLng(),
      success: function(data) {
        // alert('marker : ' + data.result);
        mouse3words[mouseMarkerCount] = data;

        var content = '<div style="padding:5px;">' + mouse3words[mouseMarkerCount] + '</div>';

        mouseMarker[mouseMarkerCount] = new daum.maps.Marker({
          map: map,
          //getLat() : 위도, getLng() : 경도
          position: new daum.maps.LatLng(mouseEvent.latLng.getLat(), mouseEvent.latLng.getLng())
        });

        mouseInfowindow[mouseMarkerCount] = new daum.maps.InfoWindow({
          content: content,
          position: mouseEvent.latLng
        });
        (function(mouseMarker, mouseInfowindow, mouse3words) {

          mouseMarker.addListener("click", function() {

            var e = document.getElementById("popupAlertPosition");
            if (e.style.display == 'block')
              e.style.display = 'none';
            else
              e.style.display = 'block';

            document.getElementById("alerttext").innerHTML = "'" + mouse3words + "'를 경로에 추가하시겠습니까?";
            var t = $("<a href='javascript:void(0)' id = " + mouse3words + " onclick='addRoute(this.id," + mouseMarker.getPosition().getLng() + "," + mouseMarker.getPosition().getLat() + ")'><span class='btnTime'>OK</span></a>");
            $("#customAlert").append(t);
            var t = $("<a href='javascript:void(0)' onclick='closePopUp();'><span class='btnTime'>NO</span></a>");
            $("#customAlert").append(t);

            //mouseMarker.setMap(null);
            //mouseInfowindow.close();
          });

          /*
          $(mouseMarker).on("click", function () {
              mouseMarker.setMap(null);
              mouseInfowindow.close();
          });
          */
        })(mouseMarker[mouseMarkerCount], mouseInfowindow[mouseMarkerCount], mouse3words[mouseMarkerCount]);


        mouseInfowindow[mouseMarkerCount].open(map, mouseMarker[mouseMarkerCount]);
        mouseMarkerCount++;
      }
      // ,  error:function(request, status, error){
      //        alert("message:"+request.responseText+"\n"+"error:"+error);
      // }

    });

    //    },2000);
  });

  // 커스텀 오버레이 컨텐츠를 설정합니다
  placeOverlay.setContent(contentNode);
}

// function serach() {
//      $.ajax({
//         url : 'http://192.168.0.14:8000/test',
//         data : { "member_no": <%=Session("member_no")%>},
//         type : 'post',
//         success:function(response) {
//             document.getElementById("output").value = response.data;
//         }
//      });
// }

// function getMyLocation() {
//     myPosition = navigator.geolocation.watchPosition(drawMyPositionMarker, error);
// }

function setTile() { // Tile 그리기 함수
  // 지도의 현재 레벨을 얻어옵니다
  var level = map.getLevel();
  map.removeOverlayMapTypeId(daum.maps.MapTypeId.TILE_NUMBER);

  if (level <= 7) { // ZOOM-LEVLE 7 = 1km
    daum.maps.Tileset.add('TILE_NUMBER',
      new daum.maps.Tileset({
        width: 125,
        height: 100,
        getTile: function(x, y, z) {
          var div = document.createElement('div');
          // div.innerHTML = x + ', ' + y + ', ' + z;
          //div.style.fontSize = '36px';
          //div.style.fontWeight = 'bold';
          //div.style.lineHeight = '256px'
          //div.style.textAlign = 'center';
          //div.style.color = '#000000';
          div.style.border = '1px dashed #ffffff';
          return div;
        }
      }));
    map.addOverlayMapTypeId(daum.maps.MapTypeId.TILE_NUMBER);
  }
}

// 각 카테고리에 클릭 이벤트를 등록합니다
function addCategoryClickEvent() {
    // var category = document.getElementById("category");
    var children = document.getElementById("category").children;
    for (var i = 0; i < children.length; i++) {
        children[i].onclick = onClickCategory;
    }
}

// 카테고리를 클릭했을 때 호출되는 함수입니다
function onClickCategory() {
    var id = this.id,
        className = this.className;

    placeOverlay.setMap(null);

    if (className === 'on') {
        currCategory = '';
        changeCategoryClass();
        removeMarker();
    } else {
        currCategory = id;
        changeCategoryClass(this);
        searchPlaces();
    }
}

// 클릭된 카테고리에만 클릭된 스타일을 적용하는 함수입니다
function changeCategoryClass(el) {
    var category = document.getElementById('category'),
        children = category.children,
        i;

    for (i = 0; i < children.length; i++) {
        children[i].className = '';
    }

    if (el) {
        el.className = 'on';
    }
}

// 카테고리 검색을 요청하는 함수
function searchPlaces() {
    centerLatlng = map.getCenter();
    currentBound = map.getBounds();
    drawCenterMarker();

    if (!currCategory) {
        return;
    }

    // 커스텀 오버레이를 숨깁니다
    placeOverlay.setMap(null);
    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();
    //ps 전역변수 - 리팩토링 고민
    ps.categorySearch(currCategory, placesSearchCB, { bounds: currentBound });
}

function drawCenterMarker() { // center마커 그리는 함수
    if (centerMarker != null) centerMarker.setMap(null);

    if (centerInfowindow != null) centerInfowindow.close();
    var center3words;

    $.ajax({
        url: '/map/marker',
        type: 'get',
        data: 'x_center=' + centerLatlng.getLat() + '&y_center=' + centerLatlng.getLng(),
        success: function (data) {
          // alert(data);
            center3words = data;

            var content = '<div style="padding:5px;">' + center3words + '</div>';

            centerMarker = new daum.maps.Marker({
                map: map,
                position: centerLatlng
            });
  /*
            centerMarker = new google.maps.Marker({
                map: map,
                position: centerLatlng
            });
  */
            (function (center3words, centerLatlng) {
                daum.maps.event.addListener(centerMarker,'click', function () {


                var e = document.getElementById("popupAlertPosition");
                if (e.style.display == 'block')
                    e.style.display = 'none';
                else
                    e.style.display = 'block';

                document.getElementById("alerttext").innerHTML = "'"+center3words + "'를 경로에 추가하시겠습니까?";
                var t = $("<a href='javascript:void(0)' id = "+center3words+" onclick='addRoute(this.id," + centerLatlng.getLng() + "," + centerLatlng.getLat()+ ")'><span class='btnTime'>OK</span></a>");
                $("#customAlert").append(t);
                var t = $("<a href='javascript:void(0)' onclick='closePopUp();'><span class='btnTime'>NO</span></a>");
                $("#customAlert").append(t);
                });

            })(center3words, centerLatlng);

            centerInfowindow = new daum.maps.InfoWindow({
                content: content,
                position: centerLatlng
            });

            centerInfowindow.open(map, centerMarker);
        }
    });
}

// 지도 위에 표시되고 있는 카테고리 관련 마커를 모두 제거
function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}


// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
    if (status === daum.maps.services.Status.OK) {
        //console.log(data);
        // 정상적으로 검색이 완료됐으면 지도에 마커를 표출합니다
        displayPlaces(data);
    } else if (status === daum.maps.services.Status.ZERO_RESULT) {
        // 검색결과가 없는경우 해야할 처리가 있다면 이곳에 작성해 주세요
        console.log("장소가 검색되지 않습니다");
    } else if (status === daum.maps.services.Status.ERROR) {
        // 에러로 인해 검색결과가 나오지 않은 경우 해야할 처리가 있다면 이곳에 작성해 주세요
        console.log("에러가 발생했습니다");
    }
}

// 지도에 마커를 표출하는 함수입니다
function displayPlaces(places) {

    var order = document.getElementById(currCategory).getAttribute('data-order');

    //console.log(places.length);

    for (var i = 0; i < places.length; i++) {

        // 마커를 생성하고 지도에 표시합니다
        var marker = addMarker(new daum.maps.LatLng(places[i].y, places[i].x), order);

        // 마커와 검색결과 항목을 클릭 했을 때
        // 장소정보를 표출하도록 클릭 이벤트를 등록합니다
        (function (marker, place) {
            daum.maps.event.addListener(marker, 'click', function () {
                displayPlaceInfo(place);
            });
        })(marker, places[i]);
    }
}

// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position, order) {
    var imageSrc = 'http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_category.png'; // 마커 이미지 url, 스프라이트 이미지를 씁니다
    var imageSize = new daum.maps.Size(27, 28),  // 마커 이미지의 크기
        imgOptions = {
            spriteSize: new daum.maps.Size(72, 208), // 스프라이트 이미지의 크기
            spriteOrigin: new daum.maps.Point(46, (order * 36)), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new daum.maps.Point(11, 28) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imgOptions),
        marker = new daum.maps.Marker({
            position: position, // 마커의 위치
            image: markerImage
        });

    marker.setMap(map); // 지도 위에 마커를 표출합니다
    markers.push(marker);  // 배열에 생성된 마커를 추가합니다

    return marker;
}

// 지도 위에 표시되고 있는 카테고리 관련 마커를 모두 제거
function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

// 클릭한 마커에 대한 장소 상세정보를 커스텀 오버레이로 표시하는 함수입니다
function displayPlaceInfo(place) {
    var name = place.place_name;
    var content = '<div class="placeinfo">' +
        '   <a class="title" href="' + place.place_url + '" target="_blank" title="' + place.place_name + '">' + place.place_name + '</a>';

    if (place.road_address_name) {
        content += '    <span title="' + place.road_address_name + '">' + place.road_address_name + '</span>' +
            '  <span class="jibun" title="' + place.address_name + '">(지번 : ' + place.address_name + ')</span>';
    } else {
        content += '    <span title="' + place.address_name + '">' + place.address_name + '</span>';
    }

    content += '    <span class="tel" >' + place.phone + '<input type="button" style="margin-left:10px;padding:2px 8px;" id="' + name + '"value="+" onclick="addRoute(this.id' + ',' + place.x + ',' + place.y + ')" /></span>' +
        '</div>' +
        '<div class="after"></div>';

    contentNode.innerHTML = content;
    placeOverlay.setPosition(new daum.maps.LatLng(place.y, place.x));
    placeOverlay.setMap(map);
}

// 위도와 경도를 저장
function addRoute(name, x, y) { // linked list에 항목 이름, x,y node로 만들어 추가
    $("#customAlert").empty();
    var e = document.getElementById("popupAlertPosition");
    if (e.style.display == 'block')  // popup close
        e.style.display = 'none';

    routeItem.add(name, x, y);
    routeItem.print(); //
}

// 마커에 관한 팝업을 닫기
function closePopUp() {
    $("#customAlert").empty();
    var e = document.getElementById("popupAlertPosition");
    if (e.style.display == 'block')
        e.style.display = 'none';
    else
        e.style.display = 'block';
}
