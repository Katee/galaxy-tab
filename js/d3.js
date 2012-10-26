var w = $(window).width(),
    h = $(window).height();

var svg = d3.select("body").append("svg:svg").attr("width", w).attr("height", h);

var nodes = [];
var links = [];
var all_visits = {};
var history_items = {};

var force = d3.layout.force().charge(-120).linkDistance(30).size([w, h]);

chrome.history.search({text: ""}, function (history_pages){
  for (var i in history_pages) {
    var tab = history_pages[i];
    history_pages[i].d3_id = i;
    history_items[history_pages[i].id] = history_pages[i];
    var node = {
      name: tab.url,
      history_id: tab.id
    };
    nodes.push(node);
  }

  $.each(history_pages, function(index, history_page) {
    chrome.history.getVisits({url: history_page.url}, function (visitItems) {
      for (j in visitItems) {
        all_visits[visitItems[j].visitId] = visitItems[j];
      }
    });
  });

  setTimeout(function(){
    $.each(all_visits, function(key, visit){
      try {
        var refervisit = all_visits[visit.referringVisitId];
        if (refervisit !== null && history_items[visit.id].d3_id !== history_items[refervisit.id].d3_id) {
          links.push({
              source: Number(history_items[visit.id].d3_id),
              target: Number(history_items[refervisit.id].d3_id)
          });
        }
      } catch (e) {}
    });

    showGraph();
  }, 100);
});

function showGraph() {
  force.nodes(nodes).links(links).start();

  var link = svg.selectAll("line.link").data(links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll("circle.node")
      .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .call(force.drag);

  node.append("title").text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
}
