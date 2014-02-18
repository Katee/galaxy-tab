var options = read_options();

var svg, w, h, force;

var nodes = [];
var links = [];
var all_visits = {};
var history_items = {};

var conf = {
  charge:           options.conf_charge,
  distance:         options.conf_distance,
  linkMinDarkness:  options.conf_linkmindark,
  nodeRadius:       options.conf_noderadius
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
    // optionally filter some nodes
    if(!options.opt_showsingletons){
      var graph = filter_singletons_index({nodes:nodes, links:links});
      nodes = graph.nodes;
      links = graph.links;
    }
  }).then(function(){
    showGraph();
    // load the translate/scale if any
    chrome.storage.local.get('svg-transform', function(data) {
      svg.attr("transform", data['svg-transform']);
    });
  });
});

// Filter out the singletons in a graph.
// :: A graph which references into the 'nodes' using indexes.
// -> A graph which references into the 'nodes' using indexes.
function filter_singletons_index(g_by_index){
    return by_index(filter_singletons_id(by_history_id(g_by_index)));
}

// Filter out the singletons in a graph.
// :: A graph which references into the 'nodes' using node.history_id.
// -> A graph which references into the 'nodes' using node.history_id.
function filter_singletons_id(g_by_id){
    var seen = {},
        newnodes = null;
    // take note of nodes which appear in the links
    g_by_id.links.forEach(function(link){
            seen[link.source] = true;
            seen[link.target] = true;
            });
    // filter nodes which weren't seen
    newnodes = nodes.filter(function(node){
            return seen[node.history_id];
            });
    return {nodes:newnodes, links:g_by_id.links};
}

function shallow_copy(obj){
    var newobj = {};
    for(var k in obj){
        if(obj.hasOwnProperty(k)){
            newobj[k] = obj[k];
        }
    }
    return newobj;
}

// Assume that node.history_id is at least as unique as node array-indexes.
// :: A graph which references into the 'nodes' array using indexes.
// -> A graph which references into the 'nodes' using node.history_id.
function by_history_id(g_by_index){
    // switch link references on each link
    var newlinks = g_by_index.links.map(function(link){
            var newlink = shallow_copy(link);
            newlink.source = g_by_index.nodes[link.source].history_id;
            newlink.target = g_by_index.nodes[link.target].history_id;
            return newlink;
            });
    return {nodes:g_by_index.nodes, links:newlinks};
}

// Assume that node.history_id is at least as unique as node array-indexes.
// :: A graph which references into the 'nodes' using node.history_id.
// -> A graph which references into the 'nodes' array using indexes.
function by_index(g_by_id){
    var newlinks = null,
        by_history_id = {},
        history_id_ct = 0;
    // create a map from history_id to nodes
    g_by_id.nodes.forEach(function(node, index){
            node.array_index = index;
            by_history_id[node.history_id] = node;
            });
    // count the number of things in the map
    for(var id in by_history_id){
        if(by_history_id.hasOwnProperty(id)){
            history_id_ct += 1;
        }
    }
    // check that history_id are unique
    if(g_by_id.nodes.length != history_id_ct){
        throw "node.history_id aren't unique";
    }
    // switch link references on each link
    newlinks = g_by_id.links.map(function(link){
            var newlink = shallow_copy(link);
            newlink.source = by_history_id[link.source].array_index;
            newlink.target = by_history_id[link.target].array_index;
            delete by_history_id[link.source].array_index;
            delete by_history_id[link.target].array_index;
            return newlink;
            });
    return {nodes:g_by_id.nodes, links:newlinks};
}

function showGraph() {
  w = $(window).width();
  h = $(window).height();
  svg = d3.select("body").append("svg:svg").attr("width", w).attr("height", h).call(d3.behavior.zoom().on("zoom", redraw)).append("g");
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
      .attr("r", conf.nodeRadius)
      .call(force.drag)
      .style("fill", nodeColor)
      .on("click", nodeClick);

  $('svg circle').tipsy({
    gravity: 's',
    html: true,
    title: function (d) {
      var d = this.__data__;
      return d.name;
    }
  });

  $('svg line').tipsy({
    gravity: 's',
    html: true,
    title: function(d) {
      var d = this.__data__;
      return d.count + [(d.count == 1 ? " visit between" : " visits between"), d.target.name, "and", d.source.name].join(" ");
    }
  });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
}

// open node's link in a new tab or window
function nodeClick(d) {
  window.open(d.name, '_blank');
}

// Use the first six characters of md5 of the nodes domain to create a color
function nodeColor(d) {
  return "#" + md5($.url(d.name).attr('host')).slice(0,6);
}

// change the translation and scale and save to local storage
function redraw() {
  var transform = "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")";
  svg.attr("transform", transform);
  chrome.storage.local.set({'svg-transform': transform}, function() {
    console.log(transform);
  });
}
