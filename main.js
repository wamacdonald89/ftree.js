//comment
var maintree;
function initialize() {
    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d"),
        tree = TREE.create("Maekar I"),
        nodes = TREE.getNodeList(tree),
        currNode = tree,
        add_child_button = document.getElementById("add_child"),
        remove_node = document.getElementById("remove_node"),
        zoom_in = document.getElementById("zoom_in"),
        zoom_out = document.getElementById("zoom_out");

    canvas.addEventListener("click", function (event) {
        var x = event.pageX - canvas.offsetLeft,
            y = event.pageY - canvas.offsetTop;
        for (var i = 0; i < nodes.length; i++) {
            if (x > nodes[i].xPos && y > nodes[i].yPos && x < nodes[i].xPos + nodes[i].width && y < nodes[i].yPos + nodes[i].height) {
                currNode.selected(false);
                nodes[i].selected(true);
                currNode = nodes[i];
                TREE.clear(context);
                TREE.draw(context, tree);
                updatePage(currNode);
                break;
            }
        }
    }, false);

    canvas.addEventListener("mousemove", function (event) {
        var x = event.pageX - canvas.offsetLeft,
            y = event.pageY - canvas.offsetTop;
        for (var i = 0; i < nodes.length; i++) {
            if (x > nodes[i].xPos && y > nodes[i].yPos && x < nodes[i].xPos + nodes[i].width && y < nodes[i].yPos + nodes[i].height) {
                canvas.style.cursor = "pointer";
                break;
            }
            else {
                canvas.style.cursor = "auto";
            }
        }
    }, false);
    add_child_button.addEventListener('click', function (event) {
        currNode.addChild(TREE.create("Child of " + currNode.text));
        TREE.clear(context);
        nodes = TREE.getNodeList(tree);
        TREE.draw(context, tree);
    }, false);
    remove_node.addEventListener('click', function (event) {
        TREE.destroy(currNode);
        TREE.clear(context);
        nodes = TREE.getNodeList(tree);
        TREE.draw(context, tree);
    }, false);
    zoom_in.addEventListener('click', function (event) {
        for (var i = 0; i < nodes.length; i++){
            nodes[i].width *= 1.05;
            nodes[i].height *= 1.05;
        }
        TREE.config.width *= 1.05;
        TREE.config.height *= 1.05;
        TREE.clear(context);
        TREE.draw(context, tree);
    }, false);
    zoom_out.addEventListener('click', function (event) {
        for (var i = 0; i < nodes.length; i++){
            nodes[i].width = nodes[i].width * 0.95;
            nodes[i].height = nodes[i].height * 0.95;
        }
        TREE.config.width *= 0.95;
        TREE.config.height *= 0.95;
        TREE.clear(context);
        TREE.draw(context, tree);
    }, false);
    context.canvas.width = document.getElementById("main").offsetWidth;
    context.canvas.height = document.getElementById("main").offsetHeight;
    populateDummyData(tree);
    nodes = TREE.getNodeList(tree);
    TREE.draw(context, tree);
    maintree = tree;
}

function updatePage(tree) {
    var info_panel = document.getElementById("information_panel");
    var header = document.getElementById("header");
    header.innerHTML = "Targaryen Family";
    var info_panel_html = "<ul>";
    info_panel_html += "<li>First Name: " +tree.text +"</li>";
    info_panel_html += "<li>Last Name: " +"Targaryen" +"</li>";
    info_panel_html += "</ul>";
    info_panel.innerHTML = info_panel_html;
}

function populateDummyData(tree) {
    tree.selected(true);
    updatePage(tree);
    tree.addChild(TREE.create("Aerion"));
    tree.addChild(TREE.create("Daeron"));
    tree.addChild(TREE.create("Aemon"));
    tree.addChild(TREE.create("Aegon V"));
    tree.addChild(TREE.create("Rhae"));
    tree.addChild(TREE.create("Daella"));
    tree.getChildAt(0).addChild(TREE.create("Maegor"));
    tree.getChildAt(1).addChild(TREE.create("Vaella"));
    tree.getChildAt(3).addChild(TREE.create("Duncan"));
    tree.getChildAt(3).addChild(TREE.create("Jaehaerys II"));
    tree.getChildAt(3).addChild(TREE.create("Shaera"));
    tree.getChildAt(3).addChild(TREE.create("Daeron"));
    tree.getChildAt(3).addChild(TREE.create("Rhaelle"));
    tree.getDescendent(11).addChild(TREE.create("Aerys II"));
    tree.getDescendent(11).addChild(TREE.create("Rhaella"));
    tree.getDescendent(15).addChild(TREE.create("Rhaegar"));
    tree.getDescendent(15).addChild(TREE.create("Shaena"));
    tree.getDescendent(15).addChild(TREE.create("Daeron"));
    tree.getDescendent(15).addChild(TREE.create("Aegon"));
    tree.getDescendent(15).addChild(TREE.create("Jaehaerys"));
    tree.getDescendent(15).addChild(TREE.create("Viserys"));
    tree.getDescendent(15).addChild(TREE.create("Daenerys"));
    tree.getDescendent(17).addChild(TREE.create("Rhaenys"));
    tree.getDescendent(17).addChild(TREE.create("Aegon"));
    tree.getDescendent(23).addChild(TREE.create("Rhaego"));
}