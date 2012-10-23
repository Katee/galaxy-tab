var all_visits = {};
var sigInst;

if (document.addEventListener) {
  document.addEventListener("DOMContentLoaded", init, false);
} else {
  window.onload = init;
}

function init() {
  chrome.history.search({text: ""}, function (history_pages){
    sigInst = sigma.init(document.getElementById("canvas")).drawingProperties({
      defaultLabelSize: 14,
      labelThreshold: 6,
      defaultEdgeType: 'curve'
    }).graphProperties({
      minNodeSize: 0.5,
      maxNodeSize: 3,
      minEdgeSize: 1,
      maxEdgeSize: 2
    }).mouseProperties({
        maxRatio: 4
    });

    for (var i in history_pages) {
      var tab = history_pages[i];
      sigInst.addNode(tab.id.toString(), {
        'label': tab.url,
        // color the node based on it's host
        'color': '#' + md5($.url(tab.url).attr('host')).slice(0,6),
        'x': Math.random(),
        'y': Math.random()
      });
    }

    for (i in history_pages) {
      tab = history_pages[i];
      chrome.history.getVisits({url: tab.url}, function (visitItems) {
        for (j in visitItems) {
          all_visits[visitItems[j].visitId] = visitItems[j];
        }
      });
    }

    setTimeout(function(){
      $.each(all_visits, function(key, visit){
        try {
          var refervisit = all_visits[visit.referringVisitId];
          if (refervisit !== null) {
            sigInst.addEdge(visit.id + "," + refervisit.id, visit.id, refervisit.id);
          }
        } catch (e) {}
      });
      sigInst.draw();
      toggleAtlas();
      
      // stop altas afer 4 seconds, makes it more friendly for background tabs
      setTimeout(function(){toggleAtlas();}, 4000);
    }, 1000);
    // get rid of this timeout
  });
}

var isRunning = false;
function toggleAtlas() {
  if(isRunning){
    isRunning = false;
    sigInst.stopForceAtlas2();
  }else{
    isRunning = true;
    sigInst.startForceAtlas2();
  }
}

$(document).ready(function(){
  $('body').on('click', 'a[href=#toggleAtlas]', function(){
    toggleAtlas();
  });
});
