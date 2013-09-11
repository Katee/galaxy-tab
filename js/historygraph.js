var svg, w, h, force;

var nodes = [];
var links = [];
var all_visits = {};
var history_items = {};

var conf = {
  charge: -80,
  distance: 30,
  linkMinDarkness: 0.5
};

chrome.history.search({text: "", maxResults: 0}, function (history_pages){
  $.each(history_pages, function(i, history_page){
    var tab = history_page;
    history_pages[i].d3_id = i;
    history_items[history_pages[i].id] = history_pages[i];
    var node = {
      name: tab.url,
      history_id: tab.id
    };
    nodes.push(node);
  });

  Q.all(
    $.map(history_pages, function(history_page){
      var deferred = Q.defer();
      chrome.history.getVisits({url: history_page.url}, function(historyItems){
        deferred.resolve(historyItems);
      });
      return deferred.promise;
    })
  ).then(function(historyItems){
    $.map(historyItems, function(visitItems, i){
      $.map(visitItems, function(el, i){
        all_visits[el.visitId] = visitItems[i];
      });
    });
    $.each(all_visits, function(key, visit){
      try {
        var refervisit = all_visits[visit.referringVisitId];
        if (refervisit === null || history_items[visit.id].d3_id === history_items[refervisit.id].d3_id) return;
        var source = Number(history_items[visit.id].d3_id);
        var target = Number(history_items[refervisit.id].d3_id);
        var existingLink = _.find(links, function(a){return a.source == source && a.target == target});
        if (existingLink == undefined) {
          links.push({
            source: Number(history_items[visit.id].d3_id),
            target: Number(history_items[refervisit.id].d3_id),
            count: 1
          });
        } else {
          existingLink.count++;
        }
      } catch (e) {}
    });
  }).then(function(){
    showGraph();
  });
});

function showGraph() {
  w = $(window).width();
  h = $(window).height();
  svg = d3.select("body").append("svg:svg").attr("width", w).attr("height", h);
  force = d3.layout.force().charge(conf.charge).linkDistance(conf.distance).size([w, h]);
  force.nodes(nodes).links(links).start();

  var biggest = _.last(_.sortBy(links, function(a){return a.count;}));
  var range = (1 - conf.linkMinDarkness) / biggest.count;

  var link = svg.selectAll("line.link").data(links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.count); })
      .style("stroke", function(d) { var color = (d.count * range + conf.linkMinDarkness); return 'rgba(0,0,0,'+color+')'; });

  var node = svg.selectAll("circle.node")
      .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .call(force.drag)
      .style("fill", nodeColor)
      .on("click", click);

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

function click(d) {}

function nodeColor(d) {
  return "#" + md5($.url(d.name).attr('host')).slice(0,6);
}
